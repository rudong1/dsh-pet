"""Read sprite alpha and write SVG display clips. Never alters source image pixels."""
import argparse,hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label,find_objects,binary_dilation
parser=argparse.ArgumentParser()
parser.add_argument('source',type=Path)
parser.add_argument('output',type=Path)
parser.add_argument('--columns',type=int,default=2)
parser.add_argument('--rows',type=int,default=2)
parser.add_argument('--reassign-island',action='append',default=[],metavar='LABEL:POSE',help='Assign an alpha component crossing a grid boundary to its intended zero-based pose')
args=parser.parse_args()
im=Image.open(args.source).convert('RGBA');a=np.asarray(im)[:,:,3]
labels,n=label(a>32);sizes=np.bincount(labels.ravel());boxes=find_objects(labels)
overrides={}
for assignment in args.reassign_island:
 component,pose=map(int,assignment.split(':'))
 assert 0<component<=n and sizes[component]>=24,'Unknown or too-small alpha island: '+str(component)
 assert 0<=pose<args.rows*args.columns,'Unknown pose: '+str(pose)
 overrides[component]=pose
def contours(mask):
 # Directed pixel-square boundaries, used only as SVG view clipping geometry.
 padded=np.pad(mask,1)
 directions=[((0,-1),(0,0),(1,0)),((1,0),(1,0),(1,1)),((0,1),(1,1),(0,1)),((-1,0),(0,1),(0,0))]
 edges={}
 for (dx,dy),(sx,sy),(ex,ey) in directions:
  neighbor=padded[1+dy:1+dy+mask.shape[0],1+dx:1+dx+mask.shape[1]]
  ys,xs=np.where(mask & ~neighbor)
  for x,y in zip(xs.tolist(),ys.tolist()):edges.setdefault((x+sx,y+sy),[]).append((x+ex,y+ey))
 paths=[]
 while edges:
  first=next(iter(edges));p=first;points=[p]
  while True:
   choices=edges[p];q=choices.pop()
   if not choices:del edges[p]
   points.append(q);p=q
   if p==first:break
  if len(points)>20:paths.append(points)
 return paths

def simplify(points,epsilon=.7):
 if len(points)<3:return points
 a=np.array(points[0],float);b=np.array(points[-1],float);v=b-a
 arr=np.array(points,float)
 if np.dot(v,v)==0:dist=np.sum((arr-a)**2,axis=1)**.5
 else:
  t=np.clip(((arr-a)@v)/np.dot(v,v),0,1)
  dist=np.sum((arr-a-t[:,None]*v)**2,axis=1)**.5
 idx=int(np.argmax(dist))
 if dist[idx]>epsilon:return simplify(points[:idx+1],epsilon)[:-1]+simplify(points[idx:],epsilon)
 return [points[0],points[-1]]

poses=[]
for row in range(args.rows):
 for col in range(args.columns):
  ids=[]
  for idx,box in enumerate(boxes,1):
   if box is None or sizes[idx]<24:continue
   y,x=box;cx=(x.start+x.stop)/2;cy=(y.start+y.stop)/2
   owner=overrides.get(idx,min(args.rows-1,int(cy/im.height*args.rows))*args.columns+min(args.columns-1,int(cx/im.width*args.columns)))
   if owner==row*args.columns+col:ids.append(idx)
  assert ids and max(sizes[i] for i in ids)>im.width*im.height/(args.rows*args.columns)*.05,'Missing or merged actor at '+str((row,col))
  mask=np.isin(labels,ids)
  assert not any(np.any(e) for e in [mask[0],mask[-1],mask[:,0],mask[:,-1]]),'Actor touches image boundary: '+str((row,col))
  mask=binary_dilation(mask,iterations=2);ys,xs=np.where(mask)
  box=[max(0,int(xs.min())-4),max(0,int(ys.min())-4),min(im.width,int(xs.max())+5),min(im.height,int(ys.max())+5)]
  parts=[]
  for path in contours(mask):
   half=len(path)//2;pts=simplify(path[:half+1],.6)[:-1]+simplify(path[half:],.6)
   parts.append('M'+' L'.join(f'{x},{y}' for x,y in pts)+' Z')
  poses.append({'box':box,'path':' '.join(parts)})
  print(args.source.stem,'cell',row*args.columns+col,'bounds',box,'foreground',int(sum(sizes[i] for i in ids)))
result={'sourceSha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'sourceWidth':im.width,'sourceHeight':im.height,'poses':poses}
args.output.write_text('// Read-only alpha analysis; original PNG preserved.\nexport default '+json.dumps(result,separators=(',',':'))+'\n')
