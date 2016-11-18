This software is my Thesis for the Department of Electrical And Computer Engineering at the University Of Thessaly

Title of Thesis :
Υλοποίηση και οπτικοποίηση βασικών αλγορίθμων
για εκπομπή, ομαδοποίηση κόμβων και έλεγχο
τοπολογίας σε ασύρματα ad hoc δίκτυα

Implementation and visualization of algorithms
for broadcasting, clustering and topology control
in wireless ad hoc networks

Software Purpose :
Visually aid the professor's teaching and students' studying of 
the Ad Hoc networking algorithms for the University lesson "Mobile 
and Ad Hoc Computing". The algorithms supported are:
* Wu & Li
* DCA clusters
* Multipoint Relays
* Max Min D Cluster
* MIS (Maximal Independent Set)
* LMST graph
* RNG graph
* GG graph

Functionality :
The users can construct a wireless network represented by
a graph, with graph manipulating tools. Then they can choose
from a list of algorithms and execute them on the network that
they created. The results of each step will be represented both 
by visual changes in the graph and explanatory text. They will
have the ability to save the created network and load it again
when they wish. 

Technical :
This is a Node.js Web App. 
The app starts by executing the application.js file with Node's command.
node_modules is a folder used by node js packages.
The code is divided in the Client code and the Server code, in
their respective folders.
The Client code has the html templates with their Css and the
Model folder which contains js files that handle user interaction
with the web page.
The Server code has the Algorithm related files in a corresponding
folder, to separate them from its core files. The server.js file
creats an Http server which sends the GET requests to the router.js
module and the POST requests to the ajaxHandler.js. The router module
uses requestHandler.js's functions to respond, and the ajaxHandler 
takes the network info and which algorithm was selected and calls
the appropriate algorithm passing the network info. Then it sends
the response back to the client.