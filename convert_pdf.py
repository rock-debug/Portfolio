import fitz

doc = fitz.open("docs/12306205summertraining.pdf")
page = doc.load_page(0)
pix = page.get_pixmap(dpi=150)
pix.save("images/summertraining.png")

doc2 = fitz.open("docs/CODEIITM.pdf")
page2 = doc2.load_page(0)
pix2 = page2.get_pixmap(dpi=150)
pix2.save("images/CODEIITM.png")
