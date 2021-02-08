# Locate UPRN Tutorial

- Search for address/UPRN (OS Places API) > 
- Once user selects the right address, zoom the map (OS Vector Tile API) in to that location > 
- Extrude and highlight (#FF1F5B) the building footprint for that address (send UPRN to OS Linked IDs API and return the TOID, use TOID to style the building from OS Vector Tile API) > 
- Display the full address in a pop-up or panel.
 
Could potentially extend it further by pulling in more info using the UPRN or postcode as a hook to 3rd party APIs (if there are any!) Could also show more local features e.g. greenspaces
 
via @charley_glynn :D 

Javascript type-ahead type searches. 
