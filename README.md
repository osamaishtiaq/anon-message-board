**FreeCodeCamp**- Information Security and Quality Assurance
------

Project Anon Message Board

## Successfully Completed
### All user stories complete.
### You can use the API Endpoints

#### GET /api/replies/{board}?thread_id={thread_id}
#### GET /api/threads/{board}
#### POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.Saved will #### be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, &####  replies(array)
#### POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board}####  and it will also update the bumped_on date to the comments date. In the thread's 'replies' array will be saved _id, text, #### created_on, delete_password, & reported.
#### send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password.
#### send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. (Text response #### will be 'incorrect password' or 'success'
#### report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} and pass along the #### thread_id. (Text response will be 'success')
#### report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')