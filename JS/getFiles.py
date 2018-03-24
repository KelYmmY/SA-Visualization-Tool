# -*- coding: UTF-8 -*-
import os
import codecs
path = "D:\\fall2017\\221\\ArchitectureVisualization"
files= os.listdir(path+"\\data")
csvFiles = "this.csvFiles = ["
xmlFiles = "this.xmlFiles = ["
for file in files:
	if(file.find(".csv")>=0):
		csvFiles = csvFiles+"'../data/"+file+"',"
	elif(file.find(".xml")>=0):
		xmlFiles = xmlFiles+"'../data/"+file+"',"
csvFiles = csvFiles[0:-1]
csvFiles += "];"
xmlFiles = xmlFiles[0:-1]
xmlFiles += "];"
lines = []
f=codecs.open(path+'\\JS\\readData.js','r','utf-8')
for line in f:
    lines.append(line)
f.close()
lines.insert(10, csvFiles)
lines.insert(11, xmlFiles)
s=''.join(lines)
f=codecs.open(path+"\\JS\\readData.js",'w+','utf-8') 
f.write(s)
f.close()
del lines[:]   