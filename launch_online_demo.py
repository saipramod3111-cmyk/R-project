import subprocess
import re
import time
import urllib.request
import sys
import os

print("=" * 72)
print("  DiaPredict — 1-Click Live Online Demonstration Launcher")
print("=" * 72)
print()

# Step 1: Check if R backend is already running on port 8000
print("[1/2] Checking if local R Plumber backend is running on port 8000...")
backend_running = False
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=2) as resp:
        if resp.status == 200:
            backend_running = True
            print("  [OK] R Plumber backend is already running on port 8000!")
except Exception:
    pass

if not backend_running:
    print("  [INFO] Starting R Plumber backend in a separate window...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    bat_path = os.path.join(script_dir, "run_backend.bat")
    subprocess.Popen(f'start "" "{bat_path}"', shell=True)
    
    # Wait for R backend to initialize
    print("  Waiting for R server to initialize...", end="", flush=True)
    for _ in range(25):
        time.sleep(1)
        print(".", end="", flush=True)
        try:
            with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=1) as resp:
                if resp.status == 200:
                    backend_running = True
                    break
        except Exception:
            pass
    print()
    if backend_running:
        print("  [OK] R Plumber backend is live and healthy!")
    else:
        print("  [WARN] Backend is starting in separate window.")

print()
print("[2/2] Starting secure Cloudflare HTTPS Tunnel...")
cloudflared_path = r"C:\Program Files (x86)\cloudflared\cloudflared.exe"
if not os.path.exists(cloudflared_path):
    cloudflared_path = "cloudflared"

proc = subprocess.Popen(
    [cloudflared_path, "tunnel", "--url", "http://127.0.0.1:8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1
)

tunnel_url = None
url_regex = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

for line in iter(proc.stdout.readline, ""):
    sys.stdout.write(line)
    sys.stdout.flush()
    match = url_regex.search(line)
    if match and not tunnel_url:
        tunnel_url = match.group(0)
        direct_link = f"https://r-project-tau.vercel.app/?api={tunnel_url}"
        
        # Copy to clipboard
        try:
            p = subprocess.Popen("clip", stdin=subprocess.PIPE, shell=True)
            p.communicate(input=direct_link.encode("utf-8"))
        except Exception:
            pass

        print()
        print("=" * 72)
        print("  SUCCESS! YOUR DEMO IS LIVE ONLINE ACROSS ALL DEVICES")
        print("=" * 72)
        print()
        print("  Tunnel URL:    " + tunnel_url)
        print()
        print("  >>> OPEN THIS LINK ON YOUR LAPTOP OR PHONE: <<<")
        print("  " + direct_link)
        print()
        print("  [COPIED TO CLIPBOARD!] Paste (Ctrl+V) this link in WhatsApp, Email,")
        print("  or Browser on your laptop. It will connect automatically!")
        print("=" * 72)
        print()
        print("  NOTE: Keep this window and the R window OPEN during presentation.")
        print()

proc.wait()
