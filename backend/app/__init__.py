# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from .db.database import Base, engine
# from .routers import auth, cities, data
#
# app = FastAPI()
#
# # CORS configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# # Include routers
# app.include_router(auth.router)
# app.include_router(cities.router)
# app.include_router(data.router)
#
# # Create database tables
# @app.on_event("startup")
# async def startup():
#     Base.metadata.create_all(bind=engine)
