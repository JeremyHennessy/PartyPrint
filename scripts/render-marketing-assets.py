"""Marketing artwork made from genuine, deterministic PartyPrint vector PDFs.

Input PDFs come from make-marketing-pdfs.mjs, using the actual source game
generator and production jsPDF renderer. No hand-drawn game grids.
Development-only script; these Python packages are not part of site runtime.
"""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
import fitz
from PIL import Image, ImageDraw, ImageFont, ImageFilter

INK="#352f35"
CORAL="#bd604d"
WHITE="#fffdfa"
PALE={"baby":"#f9e6dd","bridal":"#f5e5ed","birthday":"#f7eacb","office":"#e5eee4","scavenger":"#e9ecf4"}
ACCENT={"baby":"#bd604d","bridal":"#9b587c","birthday":"#86633b","office":"#4e745a","scavenger":"#5a668e"}
DATA={
    "baby":("baby-gift-bingo.pdf","Baby shower","GIFT-OPENING BINGO","Make a different bingo card for every guest."),
    "bridal":("bridal-trivia.pdf","Bridal shower","TRIVIA GAMES","Twelve friendly questions and a host answer key."),
    "birthday":("birthday-bingo.pdf","Birthday party","BINGO CARDS","Personalized party-moment bingo in minutes."),
    "office":("office-bingo.pdf","Office party","BINGO CARDS","Easy icebreakers that your team can print."),
    "scavenger":("scavenger.pdf","Party","SCAVENGER HUNT","A ready-to-print game of find and seek.")
}
FONTS={
    "bold":"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "body":"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "serif":"/usr/share/fonts/truetype/dejavu/DejaVuSerifCondensed-Italic.ttf"
}
def font(kind,size):
    return ImageFont.truetype(FONTS[kind],size)
def roundbox(draw,x,y,w,h,fill,radius=20):
    draw.rounded_rectangle((x,y,x+w,y+h),radius=radius,fill=fill)
def fitted(draw,word,x,y,maxwidth,size,color,kind="bold",minimum=13):
    while size>minimum and draw.textbbox((0,0),word,font=font(kind,size))[2]>maxwidth:
        size-=1
    draw.text((x,y),word,font=font(kind,size),fill=color)
def pill(draw,label,x,y,bg,fg,size=17):
    f=font("bold",size)
    w=int(draw.textbbox((0,0),label,font=f)[2])+32
    roundbox(draw,x,y,w,size+23,bg,(size+23)//2)
    draw.text((x+16,y+9),label,font=f,fill=fg)
def confetti(canvas):
    d=ImageDraw.Draw(canvas)
    w,h=canvas.size
    for i,(xx,yy,r,color) in enumerate([
        (.04,.18,11,CORAL),(.92,.13,10,"#738c72"),(.96,.74,8,"#f1bd6e"),
        (.04,.82,8,"#a1b7aa"),(.93,.92,9,"#da9088")]):
        x,y=int(xx*w),int(yy*h)
        d.ellipse((x-r,y-r,x+r,y+r),fill=color)
        if not i%2:d.line((x+20,y-16,x+34,y-33),fill=color,width=max(3,w//240))
def pdf_image(path):
    with fitz.open(path) as doc:
        assert 1<=len(doc)<=2, "Expected 1 or 2 pages: "+str(path)
        page=doc.load_page(0)
        text=page.get_text()
        assert "PARTYPRINT ORIGINALS" in text, "Not PartyPrint PDF"
        assert any(token in text for token in ("BINGO!","trivia time","find & seek")), "Game type missing"
        pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
        image=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
        return image,hashlib.sha256(path.read_bytes()).hexdigest(),text[:170].replace("\n"," | ")
def overlay_sheet(canvas,paper,x,y,w,h,angle=4):
    scale=min(w/paper.width,h/paper.height)
    rendered=paper.resize((int(paper.width*scale),int(paper.height*scale)),Image.Resampling.LANCZOS).convert("RGBA")
    pad=16
    tile=Image.new("RGBA",(rendered.width+pad*2,rendered.height+pad*2),(255,255,255,0))
    tile.alpha_composite(rendered,(pad,pad))
    shade=Image.new("RGBA",tile.size,(25,21,18,82)).filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(shade.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC),(x+14,y+18))
    canvas.alpha_composite(tile.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC),(x,y))
def brand(d,x,y,scale=1):
    f=font("bold",int(24*scale))
    a="Party"
    d.text((x,y),a,font=f,fill=INK)
    dx=d.textbbox((0,0),a,font=f)[2]
    d.text((x+dx,y),"Print",font=f,fill=CORAL)
def thumb(key,sheet):
    _,occasion,game,line=DATA[key]
    im=Image.new("RGBA",(720,420),PALE[key])
    d=ImageDraw.Draw(im)
    d.ellipse((555,-110,830,160),fill="#ffffffa2")
    d.ellipse((-135,305,175,620),fill="#ffffff76")
    confetti(im)
    pill(d,"REAL PRINTABLE",32,31,WHITE,ACCENT[key],14)
    fitted(d,occasion,32,108,344,36,INK,"serif")
    fitted(d,game,32,165,345,31,ACCENT[key])
    fitted(d,line,32,235,332,16,INK,"body")
    pill(d,"FREE · NO SIGNUP",32,336,"#fffaf4",INK,12)
    overlay_sheet(im,sheet,377,-57,360,513,7)
    return im.convert("RGB")
def landscape(key,sheet):
    _,occasion,game,line=DATA[key]
    im=Image.new("RGBA",(1200,630),PALE[key])
    d=ImageDraw.Draw(im)
    d.ellipse((835,-180,1390,460),fill="#ffffff85")
    d.ellipse((-190,480,270,940),fill="#ffffff66")
    confetti(im)
    brand(d,60,55,1.4)
    pill(d,"FREE PRINTABLE PARTY GAMES",60,140,WHITE,ACCENT[key],16)
    fitted(d,occasion,62,215,620,60,INK,"serif")
    fitted(d,game,62,303,633,55,ACCENT[key])
    d.line((64,384,560,384),fill="#cfbdb2",width=2)
    fitted(d,line,64,410,600,19,INK,"body")
    roundbox(d,60,506,525,60,INK,29)
    fitted(d,"Create yours free at PartyPrint",83,519,475,21,WHITE,"bold")
    overlay_sheet(im,sheet,760,-36,460,655,8)
    return im.convert("RGB")
def portrait(key,sheet):
    _,occasion,game,line=DATA[key]
    im=Image.new("RGBA",(1000,1500),PALE[key])
    d=ImageDraw.Draw(im)
    d.ellipse((690,-210,1290,410),fill="#ffffffad")
    d.ellipse((-260,1030,260,1700),fill="#ffffff5c")
    brand(d,67,68,1.3)
    pill(d,"FREE PRINTABLE",64,167,WHITE,ACCENT[key],24)
    fitted(d,occasion,64,259,890,77,INK,"serif")
    fitted(d,game,64,354,880,66,ACCENT[key])
    fitted(d,line,67,460,850,24,INK,"body")
    overlay_sheet(im,sheet,193,550,677,845,5)
    d.rectangle((0,1334,1000,1500),fill=INK)
    fitted(d,"Personalize · Download · Print",70,1361,860,24,WHITE,"bold")
    fitted(d,"FREE AT PARTYPRINT",70,1411,860,34,"#f5b59f","bold")
    return im.convert("RGB")
def save(image,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    image.save(path,format="JPEG",quality=86,subsampling=0,optimize=True,progressive=True)
    assert path.stat().st_size<400000, (str(path),path.stat().st_size)
def main(pdfs,output):
    result={"generator":"src/core.js + src/pdf.js","type":"Rendered production PDFs; no fictitious game grids","assets":{}}
    for key,(source,_,_,_) in DATA.items():
        path=pdfs/source
        if not path.is_file():raise FileNotFoundError(str(path))
        sheet,digest,sample=pdf_image(path)
        files=[]
        dest=output/("preview-"+key+".jpg")
        save(thumb(key,sheet),dest);files.append(dest.name)
        if key!="scavenger":
            dest=output/("og-"+key+".jpg")
            save(landscape(key,sheet),dest);files.append(dest.name)
        if key in ("baby","bridal","birthday"):
            dest=output/("pin-"+key+".jpg")
            save(portrait(key,sheet),dest);files.append(dest.name)
        result["assets"][key]={"source_pdf":source,"page":1,"source_sha256":digest,"text_sample":sample,"files":files}
        for f in files:print(f, (output/f).stat().st_size)
    (output/"provenance.json").write_text(json.dumps(result,indent=2)+"\n")
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--source-dir",default="qa/marketing-pdfs")
    parser.add_argument("--output-dir",default="assets/marketing")
    args=parser.parse_args()
    main(Path(args.source_dir),Path(args.output_dir))
