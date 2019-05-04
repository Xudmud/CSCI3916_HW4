# CSCI3916_HW4
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/a1f7deb143134af8ed58#?env%5BHW4%5D=W3siZGVzY3JpcHRpb24iOnsiY29udGVudCI6IiIsInR5cGUiOiJ0ZXh0L3BsYWluIn0sInZhbHVlIjoiSldUIGV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqVmpZMkkzWmpoalpUSmxPV0kxTURBd05Ea3dZbVkxTlNJc0luVnpaWEp1WVcxbElqb2lVMmxsY25KaE1EZzNJaXdpYVdGMElqb3hOVFUyT0RReE16YzFmUS5PM1BsZ2I2cFVvNzZYWEU4NWt4ZlUxNHQxN1RSeHNlY2FCbFhUM0JIdkY4Iiwia2V5IjoidG9rZW4iLCJlbmFibGVkIjp0cnVlfV0=)  

**Basic list of requests**  
(Requests are prepopulated in the Postman collection with the correct syntax, and can be modified as needed.)  
POST Signup - Create a new user.  
POST sign in - Log in with a user account. Returns a JWT token that saves to an environment variable for future tests.
POST verify login - Echoes whatever is sent to verify a user is logged in. (requires a login token)    
GET  Get user list - Get the current user list (requires a login token)  
POST Add movie - Add a new movie to the collection (requires a login token)
POST Add movie (invalid) - Attempt to add a new movie to the collection (requires a login token). Will fail and return a 400 status code.  
GET Get movie list - Get the current list of movies, without reviews. (requires a login token)
POST Add review - Adds a new review for the given movie.  Needs the \_id field for the movie the review is being added for. (requires a login token)
POST Add review (invalid) - Attempts to add a review for a nonexistent movie (requires a login token)
GET Get movie list with reviews - Get the current list of movies, with reviews for each movie included. (requries a login token)  
GET Find specific movie (with reviews) - Searches for the movie id in the "movieId" path variable, and returns it with reviews if found (requires a login token)  
GET Find specific movie (no reviews) - Same as finding a movie with reviews, but returns just the movie information with no reviews. (requires a login token)  
PUT Modify movie - Modifies a movie entry based on title. Reviews are left untouched. (requires a login token)  
DELETE Delete a movie - Deletes the movie specified by the title.  
DELETE Delete review - Parses the user from the JWT token and attempts to delete a review for the given movie ID by that user. (requires a login token)  

Known limitations:  
Multiple reviews can be posted for a movie by the same user. I plan to modify the POST request to either create a new review or update an existing one, depending on if the user has already posted a review or not.  
At the moment, deleting a movie does not delete its associated reviews, though the reviews can be deleted with the DELETE method on the /reviews route
