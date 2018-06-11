# from __future__ import print_function
import os
import sys
sys.stdout = open("out.txt", "w+")

import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino

print(os.getcwd())

#path = '"D:\\TEMP\\test.stl"'
#
#rs.DocumentModified(False)
#rs.Command('_-Open {} _Enter'.format(path))

#f = open('C:\\Desktop\\DWG_TEST\\out.txt', 'w')
# f = open('C:\\Users\\Mini\\Desktop\\DWG_TEST\\out.txt', 'w')
# f.write('hi')
# f.close()

def get_layer(name):
    i = sc.doc.Layers.FindByFullPath(name, True)
    return sc.doc.Layers[i] if i >= 0 else None

def get_objects_by_layer(layer_name):
    return sc.doc.Objects.FindByLayer(layer_name)

def t(v):
    return 'Yes' if v else 'No'

def test_layer0():
    objs = get_objects_by_layer('0')
    
    if not objs or len(objs) == 0:
        return True
        
    if isinstance(objs[0], Rhino.DocObjects.InstanceObject):
        return True
        
    return False

def test_is_curve_closed(layer_name):
    l = get_layer(layer_name)
    os = get_objects_by_layer(l)
    
    print('test: is curve closed on layer {}:'.format(layer_name))
    for x in os:
        name = x.Name if x.Name else '<untitled>'
        
        print('{}: {}'.format(name, t(rs.IsCurveClosed(x))))
#        print('\n'.join(dir(x)))

print('test: no objects on layer 0')
print(t(test_layer0()))

#test_is_curve_closed('P_S_01_b')

for layer in sc.doc.Layers:
   test_is_curve_closed(layer.Name)

#    print(layer.FullPath)
#    print(dir(layer))