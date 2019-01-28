import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino

filename = rs.SaveFileName()

pages = sc.doc.Views.GetPageViews()
pdf = Rhino.FileIO.FilePdf.Create()
dpi = 300

for page in pages:
    capture = Rhino.Display.ViewCaptureSettings(page, dpi)
    pdf.AddPage(capture)
    print(dir(page))
    
pdf.Write(filename)