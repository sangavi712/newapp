import multiprocessing
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
workers = multiprocessing.cpu_count() * 2 + 1
threads = 2
timeout = 120
keepalive = 5
errorlog = '-'
accesslog = '-'
loglevel = 'info'
worker_class = 'sync'
