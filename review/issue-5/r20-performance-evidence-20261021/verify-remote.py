from pathlib import Path
import json,hashlib,subprocess,zipfile,datetime
b=Path('/workspace/scratch/38e8b0c92238');root=b/'pr79-opt';out=b/'pr79-opt-r20-native-readback';out.mkdir(exist_ok=False)
p=json.loads((b/'pr79-opt-r20-upload-plan.json').read_text());q='8c5d6f1723b02bbf1d4692288558816eb08afa8a';rows=[]
for item in p['entries']:
 data=subprocess.check_output(['git','show',q+':'+item['path']],cwd=root)
 assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256']
 oid=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();assert oid==item['oid']
 dest=out/Path(item['path']).name;dest.write_bytes(data);rows.append({'path':item['path'],'bytes':len(data),'sha256':item['sha256'],'oid':oid})
 print('Readback '+Path(item['path']).name,flush=True)
m=json.loads((out/'manifest.json').read_text());members={}
for a in m['archives']:
 data=(out/a['path']).read_bytes();assert len(data)==a['bytes'] and hashlib.sha256(data).hexdigest()==a['sha256']
 with zipfile.ZipFile(out/a['path']) as z:
  assert z.testzip() is None
  for item in [x for x in m['members']if x['archive']==a['path']]:
   data=z.read(item['path']);assert len(data)==item['bytes']and hashlib.sha256(data).hexdigest()==item['sha256'];members[(a['path'],item['path'])]=(len(data),item['sha256'])
for f in m['files']:assert members[(f['archive'],f['member'])]==(f['bytes'],f['sha256'])
def tree(q):
 return dict((line.split('\t',1)[1],line.split('\t',1)[0])for line in subprocess.check_output(['git','ls-tree','-r',q],cwd=root,text=True).splitlines())
a,c=tree(p['parent']),tree(q);assert all(c.get(k)==v for k,v in a.items());assert set(c)==set(a)|{x['path']for x in p['entries']}
record={'pass':True,'commit':q,'tree':'6e4bdce8b9e5cba49d4b94182f96af400d6e43d3','remoteFiles':rows,'archives':len(m['archives']),'members':len(members),'logicalFiles':len(m['files']),'priorPathsPreserved':len(a),'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Implementer transport readback/CRC/SHA256; separate independent metrics review is unchanged.'}
(out/'verification.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({k:v for k,v in record.items()if k!='remoteFiles'}),flush=True)
