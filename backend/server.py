from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import httpx
from bs4 import BeautifulSoup
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'vidtrack_secret_key_2024_change_in_production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Pydantic Models ───

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str = "creator"

class UserLogin(BaseModel):
    email: str
    password: str

class UpdateProfile(BaseModel):
    social_accounts: Optional[List[dict]] = None

class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class VideoCreate(BaseModel):
    url: str
    published_date: str

class VideoOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    url: str
    platform: str
    title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    published_date: Optional[str] = None
    creator_id: str
    last_tracked_at: Optional[str] = None
    created_at: str
    status: str = "active"
    payment_status: str = "tracking"

class SetCPM(BaseModel):
    cpm: float

class SetPaymentStatus(BaseModel):
    payment_status: str

class CreatorStats(BaseModel):
    total_views: int = 0
    total_likes: int = 0
    total_videos: int = 0
    total_comments: int = 0
    total_shares: int = 0

class AdminCreatorOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str
    stats: CreatorStats

# ─── Auth Helpers ───

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─── Platform Detection ───

def detect_platform(url: str) -> str:
    url_lower = url.lower()
    if "tiktok.com" in url_lower:
        return "tiktok"
    elif "instagram.com" in url_lower:
        return "instagram"
    raise HTTPException(status_code=400, detail="Only TikTok and Instagram URLs are supported")

def extract_tiktok_video_id(url: str) -> Optional[str]:
    patterns = [
        r'tiktok\.com/@[\w.]+/video/(\d+)',
        r'tiktok\.com/t/(\w+)',
        r'vm\.tiktok\.com/(\w+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def extract_instagram_shortcode(url: str) -> Optional[str]:
    patterns = [
        r'instagram\.com/(?:p|reel|reels)/([A-Za-z0-9_-]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

# ─── Video Scraping Service ───

async def scrape_tiktok_metrics(url: str) -> dict:
    """Try to get TikTok video metrics via oembed + page scraping."""
    result = {"title": None, "thumbnail_url": None, "views": 0, "likes": 0, "comments": 0, "shares": 0}
    
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client_http:
            # TikTok oembed API (reliable for title/thumbnail)
            oembed_url = f"https://www.tiktok.com/oembed?url={url}"
            resp = await client_http.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                result["title"] = data.get("title", "TikTok Video")
                result["thumbnail_url"] = data.get("thumbnail_url")
            
            # Try to scrape the page for metrics
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
            page_resp = await client_http.get(url, headers=headers)
            if page_resp.status_code == 200:
                html = page_resp.text
                # Try to find JSON data in the page
                # Look for SIGI_STATE or __UNIVERSAL_DATA_FOR_REHYDRATION__
                import json
                
                # Pattern 1: __UNIVERSAL_DATA_FOR_REHYDRATION__
                match = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', html, re.DOTALL)
                if match:
                    try:
                        page_data = json.loads(match.group(1))
                        default_scope = page_data.get("__DEFAULT_SCOPE__", {})
                        video_detail = default_scope.get("webapp.video-detail", {})
                        item_info = video_detail.get("itemInfo", {}).get("itemStruct", {})
                        stats = item_info.get("stats", {})
                        result["views"] = stats.get("playCount", 0)
                        result["likes"] = stats.get("diggCount", 0)
                        result["comments"] = stats.get("commentCount", 0)
                        result["shares"] = stats.get("shareCount", 0)
                        if not result["title"]:
                            result["title"] = item_info.get("desc", "TikTok Video")
                    except (json.JSONDecodeError, KeyError):
                        pass
                
                # Pattern 2: SIGI_STATE
                if result["views"] == 0:
                    match = re.search(r'<script id="SIGI_STATE"[^>]*>(.*?)</script>', html, re.DOTALL)
                    if match:
                        try:
                            page_data = json.loads(match.group(1))
                            items = page_data.get("ItemModule", {})
                            for item_id, item in items.items():
                                stats = item.get("stats", {})
                                result["views"] = stats.get("playCount", 0)
                                result["likes"] = stats.get("diggCount", 0)
                                result["comments"] = stats.get("commentCount", 0)
                                result["shares"] = stats.get("shareCount", 0)
                                break
                        except (json.JSONDecodeError, KeyError):
                            pass
    except Exception as e:
        logger.warning(f"TikTok scraping error: {e}")
    
    if not result["title"]:
        result["title"] = "TikTok Video"
    return result

async def scrape_instagram_metrics(url: str) -> dict:
    """Try to get Instagram post/reel metrics via page scraping."""
    result = {"title": None, "thumbnail_url": None, "views": 0, "likes": 0, "comments": 0, "shares": 0}
    
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client_http:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
            resp = await client_http.get(url, headers=headers)
            if resp.status_code == 200:
                html = resp.text
                soup = BeautifulSoup(html, 'lxml')
                
                # Try to get from meta tags
                og_title = soup.find("meta", property="og:title")
                if og_title:
                    result["title"] = og_title.get("content", "Instagram Video")
                
                og_image = soup.find("meta", property="og:image")
                if og_image:
                    result["thumbnail_url"] = og_image.get("content")
                
                # Try to extract view/like counts from meta description
                meta_desc = soup.find("meta", property="og:description")
                if meta_desc:
                    desc = meta_desc.get("content", "")
                    # Pattern: "X likes, Y comments"
                    likes_match = re.search(r'([\d,]+)\s*(?:likes|me gusta)', desc, re.IGNORECASE)
                    if likes_match:
                        result["likes"] = int(likes_match.group(1).replace(",", ""))
                    comments_match = re.search(r'([\d,]+)\s*comments', desc, re.IGNORECASE)
                    if comments_match:
                        result["comments"] = int(comments_match.group(1).replace(",", ""))
                    views_match = re.search(r'([\d,]+)\s*(?:views|plays|reproducciones)', desc, re.IGNORECASE)
                    if views_match:
                        result["views"] = int(views_match.group(1).replace(",", ""))
                
                # Try JSON-LD
                import json
                scripts = soup.find_all("script", type="application/ld+json")
                for script in scripts:
                    try:
                        data = json.loads(script.string)
                        if isinstance(data, dict):
                            interaction_stats = data.get("interactionStatistic", [])
                            for stat in interaction_stats if isinstance(interaction_stats, list) else []:
                                stat_type = stat.get("interactionType", {})
                                if isinstance(stat_type, dict):
                                    type_name = stat_type.get("@type", "")
                                elif isinstance(stat_type, str):
                                    type_name = stat_type
                                else:
                                    continue
                                count = int(stat.get("userInteractionCount", 0))
                                if "Watch" in type_name or "View" in type_name:
                                    result["views"] = count
                                elif "Like" in type_name:
                                    result["likes"] = count
                                elif "Comment" in type_name:
                                    result["comments"] = count
                    except (json.JSONDecodeError, ValueError):
                        pass
    except Exception as e:
        logger.warning(f"Instagram scraping error: {e}")
    
    if not result["title"]:
        result["title"] = "Instagram Video"
    return result

# ─── Auth Routes ───

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if data.role not in ("creator", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": data.role,
        "cpm": 0.0,
        "social_accounts": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, data.role)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_doc["email"],
            "name": data.name,
            "role": data.role,
            "cpm": 0.0,
            "social_accounts": [],
            "created_at": user_doc["created_at"]
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "cpm": user.get("cpm", 0.0),
            "social_accounts": user.get("social_accounts", []),
            "created_at": user["created_at"]
        }
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "cpm": user.get("cpm", 0.0),
        "social_accounts": user.get("social_accounts", []),
        "created_at": user["created_at"]
    }

@api_router.put("/auth/profile")
async def update_profile(data: UpdateProfile, user=Depends(get_current_user)):
    update_fields = {}
    if data.social_accounts is not None:
        # Validate each account has name and url
        validated = []
        for acc in data.social_accounts:
            if acc.get("name") and acc.get("url"):
                validated.append({
                    "name": acc["name"],
                    "url": acc["url"],
                    "platform": acc.get("platform", "other")
                })
        update_fields["social_accounts"] = validated
    
    if update_fields:
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {
        "id": updated["id"],
        "email": updated["email"],
        "name": updated["name"],
        "role": updated["role"],
        "cpm": updated.get("cpm", 0.0),
        "social_accounts": updated.get("social_accounts", []),
        "created_at": updated["created_at"]
    }

# ─── Video Routes ───

@api_router.post("/videos")
async def add_video(data: VideoCreate, user=Depends(get_current_user)):
    platform = detect_platform(data.url)
    
    # Check for duplicate URL for this user
    existing = await db.videos.find_one({"url": data.url, "creator_id": user["id"]}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="This video URL is already being tracked")
    
    # Scrape metrics
    if platform == "tiktok":
        metrics = await scrape_tiktok_metrics(data.url)
    else:
        metrics = await scrape_instagram_metrics(data.url)
    
    video_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    video_doc = {
        "id": video_id,
        "url": data.url,
        "platform": platform,
        "title": metrics.get("title"),
        "thumbnail_url": metrics.get("thumbnail_url"),
        "views": metrics.get("views", 0),
        "likes": metrics.get("likes", 0),
        "comments": metrics.get("comments", 0),
        "shares": metrics.get("shares", 0),
        "published_date": data.published_date,
        "creator_id": user["id"],
        "last_tracked_at": now,
        "created_at": now,
        "status": "active",
        "payment_status": "tracking"
    }
    await db.videos.insert_one(video_doc)
    
    # Remove _id before returning
    video_doc.pop("_id", None)
    return video_doc

@api_router.get("/videos")
async def get_my_videos(user=Depends(get_current_user)):
    videos = await db.videos.find(
        {"creator_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return videos

@api_router.get("/videos/stats")
async def get_my_stats(user=Depends(get_current_user)):
    pipeline = [
        {"$match": {"creator_id": user["id"]}},
        {"$group": {
            "_id": None,
            "total_views": {"$sum": "$views"},
            "total_likes": {"$sum": "$likes"},
            "total_comments": {"$sum": "$comments"},
            "total_shares": {"$sum": "$shares"},
            "total_videos": {"$sum": 1}
        }}
    ]
    result = await db.videos.aggregate(pipeline).to_list(1)
    if result:
        data = result[0]
        data.pop("_id", None)
        return data
    return {"total_views": 0, "total_likes": 0, "total_comments": 0, "total_shares": 0, "total_videos": 0}

@api_router.post("/videos/{video_id}/refresh")
async def refresh_video_metrics(video_id: str, user=Depends(get_current_user)):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Allow refresh if user is the creator or an admin
    if video["creator_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if video["platform"] == "tiktok":
        metrics = await scrape_tiktok_metrics(video["url"])
    else:
        metrics = await scrape_instagram_metrics(video["url"])
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "views": metrics.get("views", video["views"]),
        "likes": metrics.get("likes", video["likes"]),
        "comments": metrics.get("comments", video.get("comments", 0)),
        "shares": metrics.get("shares", video.get("shares", 0)),
        "last_tracked_at": now
    }
    if metrics.get("title") and metrics["title"] != video.get("title"):
        update_data["title"] = metrics["title"]
    if metrics.get("thumbnail_url") and not video.get("thumbnail_url"):
        update_data["thumbnail_url"] = metrics["thumbnail_url"]
    
    await db.videos.update_one({"id": video_id}, {"$set": update_data})
    
    updated = await db.videos.find_one({"id": video_id}, {"_id": 0})
    return updated

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, user=Depends(get_current_user)):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video["creator_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.videos.delete_one({"id": video_id})
    return {"message": "Video deleted"}

# ─── Admin Routes ───

@api_router.get("/admin/creators")
async def get_all_creators(user=Depends(require_admin)):
    creators = await db.users.find({"role": "creator"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    result = []
    for creator in creators:
        pipeline = [
            {"$match": {"creator_id": creator["id"]}},
            {"$group": {
                "_id": None,
                "total_views": {"$sum": "$views"},
                "total_likes": {"$sum": "$likes"},
                "total_comments": {"$sum": "$comments"},
                "total_shares": {"$sum": "$shares"},
                "total_videos": {"$sum": 1}
            }}
        ]
        stats_result = await db.videos.aggregate(pipeline).to_list(1)
        stats = stats_result[0] if stats_result else {"total_views": 0, "total_likes": 0, "total_comments": 0, "total_shares": 0, "total_videos": 0}
        stats.pop("_id", None)
        
        result.append({
            "id": creator["id"],
            "email": creator["email"],
            "name": creator["name"],
            "role": creator["role"],
            "cpm": creator.get("cpm", 0.0),
            "social_accounts": creator.get("social_accounts", []),
            "created_at": creator["created_at"],
            "stats": stats
        })
    
    return result

@api_router.get("/admin/creators/{creator_id}/videos")
async def get_creator_videos(creator_id: str, user=Depends(require_admin)):
    creator = await db.users.find_one({"id": creator_id}, {"_id": 0, "password_hash": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    videos = await db.videos.find(
        {"creator_id": creator_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return {"creator": creator, "videos": videos}

@api_router.get("/admin/stats")
async def get_admin_stats(user=Depends(require_admin)):
    total_creators = await db.users.count_documents({"role": "creator"})
    total_videos = await db.videos.count_documents({})
    
    pipeline = [
        {"$group": {
            "_id": None,
            "total_views": {"$sum": "$views"},
            "total_likes": {"$sum": "$likes"},
            "total_comments": {"$sum": "$comments"},
            "total_shares": {"$sum": "$shares"}
        }}
    ]
    result = await db.videos.aggregate(pipeline).to_list(1)
    agg = result[0] if result else {"total_views": 0, "total_likes": 0, "total_comments": 0, "total_shares": 0}
    agg.pop("_id", None)
    
    # Platform breakdown
    platform_pipeline = [
        {"$group": {
            "_id": "$platform",
            "count": {"$sum": 1},
            "views": {"$sum": "$views"},
            "likes": {"$sum": "$likes"}
        }}
    ]
    platform_result = await db.videos.aggregate(platform_pipeline).to_list(10)
    platforms = {}
    for p in platform_result:
        platforms[p["_id"]] = {"count": p["count"], "views": p["views"], "likes": p["likes"]}
    
    return {
        "total_creators": total_creators,
        "total_videos": total_videos,
        **agg,
        "platforms": platforms
    }

# ─── Admin CPM & Payment Routes ───

@api_router.put("/admin/creators/{creator_id}/cpm")
async def set_creator_cpm(creator_id: str, data: SetCPM, user=Depends(require_admin)):
    creator = await db.users.find_one({"id": creator_id}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    if creator.get("role") != "creator":
        raise HTTPException(status_code=400, detail="Can only set CPM for creators")
    
    await db.users.update_one({"id": creator_id}, {"$set": {"cpm": data.cpm}})
    return {"message": "CPM updated", "cpm": data.cpm}

@api_router.put("/admin/videos/{video_id}/payment")
async def set_video_payment(video_id: str, data: SetPaymentStatus, user=Depends(require_admin)):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if data.payment_status not in ("tracking", "pending", "paid"):
        raise HTTPException(status_code=400, detail="Invalid payment status")
    
    await db.videos.update_one({"id": video_id}, {"$set": {"payment_status": data.payment_status}})
    updated = await db.videos.find_one({"id": video_id}, {"_id": 0})
    return updated

# ─── App Setup ───

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
