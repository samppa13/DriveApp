import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import MyDrive from '../components/MyDrive'

const HomePage = () => {
    const auth = useContext(AuthContext)

    return (
        <div>
            <p>
                Username: {auth.user!.username}, Id: {auth.user!.id}
            </p>
            <MyDrive />
        </div>
    )
}

export default HomePage
