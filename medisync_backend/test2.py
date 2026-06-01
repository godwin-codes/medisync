import urllib.request, json, urllib.error

req1 = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/login/',
    data=json.dumps({'username':'admin','password':'admin123'}).encode(),
    headers={'Content-Type':'application/json'}
)
res1 = json.loads(urllib.request.urlopen(req1).read())

req2 = urllib.request.Request(
    'http://127.0.0.1:8000/api/patients/',
    data=json.dumps({'name':'Pat Tester', 'age':30, 'gender':'Male', 'phone':'999', 'address':'Testing Street'}).encode(),
    headers={'Content-Type':'application/json', 'Authorization':'Bearer '+res1['access']}
)
try:
    print(urllib.request.urlopen(req2).read().decode())
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode())
