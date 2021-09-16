

## Application

### Sync / persist / share / publish

With traditional websites, the model is straight forward.

1. The user visits the website and views another creators work.
2. The user visits the website, signs up for an account, creates work on the website.
3. Rarely, downloads a "non-returnable" form of the work, e.g. a PDF from Google docs
4. More rarely, downloads a "returnable" form of the work, e.g. a docx from Google docs

With the system used for this website

1. The user visits the website and views another creators work.
2. The user does not need to sign up and can start editing straight away as an anonymous user.
3. The user can set a user name
4. The user can sign into a (Solid) ID provider to get a user name
5. The user can select a cloud directory (Solid) to sync their data with
6. The user can change the permissions of the cloud directory (through the (Solid) cloud directory application) to allow others to read / write.
7. The sync / save function auto merges the content together or warns if a conflict (the remote takes precidence)
8. The user can also choose to download a "hard copy" as one json file.
9. The user can choose to upload a "hard copy" as one json file.  This will merge with the locally stored material.  And then the locally stored will merge with the remote.

Not yet considering implementing:
1. Before and during any merge, the user can choose to completely overwrite the remote or the local destination recieving the data.
