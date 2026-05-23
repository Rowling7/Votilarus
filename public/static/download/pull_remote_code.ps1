# 远程登录并执行 git pull 操作 D:\ProgramDev\LocalRepository\nodejsPity\Pitahaya\pull_remote_code.ps1
#ssh u0_a289@192.168.101.12 -p 8022 "cd pitahaya/nodejsPity/ && git checkout -- Pitahaya/data/pitahaya.db && git pull origin main"

ssh u0_a289@192.168.101.12 -p 8022 "cd pitahaya/nodejsPity/ && git pull origin main"
# 不好用
# cd ~/pitahaya/nodejsPity/Pitahaya && npm start