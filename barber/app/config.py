# import os

# basedir = os.path.abspath(os.path.dirname(__file__))

# class Config:
#     SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key'
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
#         f"sqlite:///{os.path.join(basedir, 'app.db')}"
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     DEBUG = False


# class DevelopmentConfig(Config):
#     DEBUG = True


# class TestingConfig(Config):
#     TESTING = True
#     SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# class ProductionConfig(Config):
#     DEBUG = False
#     TESTING = False
