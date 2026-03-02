import '../styles/HomePage.css'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import MyDrive from '../components/MyDrive'
import ImageGrid from '../components/ImageGrid'

const HomePage = () => {
    const auth = useContext(AuthContext)

    const imgUrl: string = 'http://localhost:9000/api/users/profile/image/file'

    return (
        <div className='home-container'>
            {
                auth.user?.profileImage
                && <ImageGrid
                    name={auth.user?.profileImage}
                    imgUrl={imgUrl}
                    isProfile={true}
                />
            }
            <h3>
                Welcome to your Drive, {auth.user!.username}!
            </h3>
            <MyDrive />
        </div>
    )
}

export default HomePage
