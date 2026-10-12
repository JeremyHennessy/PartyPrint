from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter,A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import pdfplumber
root=Path.cwd(); out=root/'output/pdf'; out.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Noto',str(root/'assets/fonts/NotoSans-Regular.ttf')))
ink=HexColor('#173655'); coral=HexColor('#e68087'); sage=HexColor('#537a68'); pale=HexColor('#fdf1ec')
for name,size in [('Letter',letter),('A4',A4)]:
 w,h=size; c=canvas.Canvas(str(out/f'PartyPrint-baby-shower-sample-{name}.pdf'),pagesize=size)
 c.setTitle('PartyPrint - A Little Love baby shower sample kit')
 def text(x,y,s,sz=11,col=ink):
  c.setFillColor(col);c.setFont('Noto',sz);c.drawString(x,y,s)
 def line(x,y,width):
  c.setStrokeColor(HexColor('#b6c7bd'));c.setLineWidth(.6);c.line(x,y,x+width,y)
 def flower(x,y,r=10):
  c.setFillColor(pale)
  for dx,dy in [(0,r),(r,0),(0,-r),(-r,0)]:c.circle(x+dx,y+dy,r*.8,stroke=0,fill=1)
  c.setFillColor(coral);c.circle(x,y,r*.45,stroke=0,fill=1)
 def page(title,sub,n):
  c.setFillColor(pale);c.rect(0,h-26,w,26,stroke=0,fill=1)
  text(40,h-61,'PARTYPRINT / A LITTLE LOVE',10,sage)
  text(40,h-103,title,26);text(40,h-128,sub,10)
  flower(w-56,h-77)
  line(40,44,w-80);text(40,27,'DESIGN SAMPLE - Free generator: partyprint.live',8,sage);text(w-60,27,str(n),8,sage)
 def finish():c.showPage()
 page('A little love. A lot of joy.','A coordinated baby-shower keepsake collection',1)
 c.drawImage(str(root/'assets/partyprint-logo.jpg'),w/2-90,h-360,width=180,height=180)
 text(65,h-420,'A welcoming celebration, ready to make your own.',14)
 for i,s in enumerate(['Host plan and game instructions','Baby predictions - two guest cards per sheet','Words of encouragement - two keepsake cards per sheet','Gift record for thoughtful thank-you notes','Baby-name alphabet game - one guest sheet']):text(65,h-463-i*27,s,11)
 text(65,116,'Print at actual size. Choose the matching Letter or A4 file.',10)
 text(65,95,'Pair with free gift-opening bingo, trivia and answer sheets.',10)
 c.linkURL('https://partyprint.live/?occasion=baby&mode=gifts#studio',(40,50,w-40,160),relative=0)
 finish()
 page('A calm, cheerful host plan','Keep participation optional. Sharing should feel comfortable.',2)
 sections=[('BEFORE GUESTS ARRIVE',['Print one prediction and encouragement card per willing guest.','Cut the two-card sheets at the dotted center line.','Generate free bingo cards using the baby-shower gift preset.','Put pens on the table and keep the gift record with the host.']),('AS EVERYONE SETTLES IN',['Invite guests to write a kind note or complete a prediction card.','Leave name and personal details optional; guests may skip prompts.','Allow five minutes for the alphabet game, then compare ideas.']),('WHILE GIFTS ARE OPENED',['Mark gift bingo only when that item is actually opened.','A bundle may cover several named items; repeated gifts mark once.','First completed row, column or diagonal wins. Use small prizes.']),('AFTER THE CELEBRATION',['Save the notes and predictions as keepsakes for the family.','Use the gift record for thank-you notes; keep it private.','If no bingo line wins, celebrate the guest with most marked squares.'])]
 y=h-175
 for title,rows in sections:
  text(40,y,title,11,sage);y-=26
  for row in rows:text(40,y,row,10);y-=22
  y-=20
 finish()
 def cards(title,sub,prompts,n):
  page(title,sub,n);top=h-163; bottom=70;gap=26;ch=(top-bottom-gap)/2
  for j in range(2):
   base=top-j*(ch+gap);c.setStrokeColor(HexColor('#b6c7bd'));c.roundRect(40,base-ch,w-80,ch,12,stroke=1,fill=0)
   text(58,base-33,title,18);text(58,base-55,'For the growing family - share only what you wish.',9,sage)
   y=base-87
   for prompt in prompts:text(58,y,prompt,10);line(58,y-20,w-116);y-=49
  c.setDash(3,4);line(40,top-ch-gap/2,w-80);c.setDash()
  finish()
 cards('Baby predictions','Print one sheet for two guests. Cut along the dotted line.',['Your name (optional)','Arrival date and time','A name idea or nickname','A tiny wish for the baby'],3)
 cards('Words of encouragement','A keepsake, not a test. Kindness is the only rule.',['From (optional)','You are going to be wonderful at...','On a difficult day, remember...','One way I would love to help...'],4)
 page('The thank-you list','Host copy - keep gift and guest details private.',5)
 widths=[(40,150,'GUEST'),(200,220,'GIFT / ITEMS'),(430,w-470,'THANKED')]
 y=h-173
 for x,ww,title in widths:text(x,y,title,9,sage)
 for i in range(12):
  y-=39
  for x,ww,title in widths:line(x,y,ww)
 text(40,83,'Use additional copies as needed. Store this sheet with the family.',9,sage);finish()
 page('Baby-name alphabet','Five minutes. Write one name for each letter; sharing is optional.',6)
 text(40,h-167,'Name / team (optional):');line(195,h-169,w-235)
 for i,ch in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):
  col=i//13;row=i%13;x=40+col*(w-80)/2;y=h-209-row*34
  text(x,y,ch,12,sage);line(x+22,y-3,(w-80)/2-42)
 text(40,80,'Compare ideas together. Any name or nickname counts; repeats are welcome.',9,sage);finish();c.save()
 with pdfplumber.open(out/f'PartyPrint-baby-shower-sample-{name}.pdf') as pdf:
  assert len(pdf.pages)==6
  for p in pdf.pages:
   assert len(p.extract_text() or '')>100
   for ch in p.chars:assert ch['x0']>=25 and ch['x1']<=w-25 and ch['top']>=25 and ch['bottom']<=h-20
 print(name,'6 pages; all pages nonblank and text inside safe bounds')

