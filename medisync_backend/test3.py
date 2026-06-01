import urllib.request, json, urllib.error

req1 = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/login/',
    data=json.dumps({'username':'admin','password':'admin123'}).encode(),
    headers={'Content-Type':'application/json'}
)
res1 = json.loads(urllib.request.urlopen(req1).read())

req2 = urllib.request.Request(
    'http://127.0.0.1:8000/api/medicines/',
    data=json.dumps({'name':'Test Paracetamol', 'price':'25.00', 'stock_quantity':200}).encode(),
    headers={'Content-Type':'application/json', 'Authorization':'Bearer '+res1['access']}
)
try:
    print(urllib.request.urlopen(req2).read().decode())
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode())
