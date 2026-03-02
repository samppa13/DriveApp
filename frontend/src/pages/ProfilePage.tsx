import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import ImageGrid from '../components/ImageGrid'
import { Button, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const ProfilePage = () => {
    const [username, setUsername] = useState<string>('')
    const [file, setFile] = useState<File | null>(null)
    const [isEditImage, setIsEditImage] = useState<boolean>(false)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const auth = useContext(AuthContext)

    // Clear success message after 2 seconds
    useEffect(() => {
        if (!message) {
            return
        }

        const timer = setTimeout(() => {
            setMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [message])

    // Clear error message after 2 seconds
    useEffect(() => {
        if (!errorMessage) {
            return
        }

        const timer = setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [errorMessage])

    // Set username from auth.user when user changes
    useEffect(() => {
        if (!auth.user?.username) {
            return
        }

        setUsername(auth.user?.username)
    }, [auth.user])

    // Handle uploading a new profile image
    const handleUploadImage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!file) {
            setErrorMessage('No file selected')
            return
        }
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Only image files allowed')
            return
        }

        setIsUploading(true)
        const formData: FormData = new FormData()
        formData.append('image', file)

        try {
            const mess = await auth.uploadImage(formData)
            setMessage(mess)
            setFile(null)
            setIsEditImage(false)
        } catch (error: any) {
            setErrorMessage(error.message)
        } finally {
            setIsUploading(false)
        }
    }

    // Handle deleting the profile image
    const handleDeleteImage = async () => {
        try {
            const mess = await auth.deleteImage()
            setMessage(mess)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    // Handle updating the username/profile
    const handleUpdateProfile = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!username) {
            setErrorMessage('Please enter username')
            return
        }

        try {
            const mess = await auth.updateProfile(username)
            setMessage(mess)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    const imgUrl: string = 'http://localhost:9000/api/users/profile/image/file'

    return (
        <div>
            {/* Display profile image if exists */}
            {auth.user?.profileImage && (
                <ImageGrid
                    name={auth.user?.profileImage}
                    imgUrl={imgUrl}
                    isProfile={true}
                />
            )}

            {/* Button to delete profile image */}
            {auth.user?.profileImage && (
                <Button variant='dark' onClick={handleDeleteImage}>
                    Delete profile image
                </Button>
            )}

            {/* Button to toggle edit/add image form */}
            <Button variant='dark' onClick={() => setIsEditImage(!isEditImage)}>
                {isEditImage
                    ? 'Cancel'
                    : auth.user?.profileImage
                        ? 'Update profile image'
                        : 'Add profile image'}
            </Button>

            {/* Form to upload new profile image */}
            {isEditImage && (
                <div>
                    <Form onSubmit={handleUploadImage}>
                        <Form.Group>
                            <Form.Control
                                type='file'
                                name='image'
                                id='image'
                                accept='image/*'
                                required
                                onChange={(event) => {
                                    const target = event.target as HTMLInputElement
                                    if (target.files && target.files.length > 0) {
                                        setFile(target.files[0])
                                    }
                                }}
                            />
                        </Form.Group>
                        <Button variant='dark' type='submit' disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </Form>
                </div>
            )}

            {/* Form to update username */}
            <Form onSubmit={handleUpdateProfile}>
                <Form.Group>
                    <Form.Label htmlFor="username">Username:</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </Form.Group>
                <Button variant='dark' type='submit'>
                    Save
                </Button>
            </Form>

            {/* Display success message */}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {/* Display error message */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    )
}

export default ProfilePage
