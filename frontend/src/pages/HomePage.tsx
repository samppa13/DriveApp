import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import MyDrive from '../components/MyDrive'

const HomePage = () => {
    const auth = useContext(AuthContext)

    return (
        <div>
            <p>
                Username: {auth.user!.username}, Id: {auth.user!._id}
            </p>
            <MyDrive />
        </div>
    )
}

export default HomePage
