const message = 'The version of ChemDoodle installed is: ' + ChemDoodle.getVersion();
alert(message);

const sketcher = new ChemDoodle.SketcherCanvas('sketcher', 500, 300, {useServices:true, oneMolecule:true});