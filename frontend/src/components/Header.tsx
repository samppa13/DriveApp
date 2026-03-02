import '../styles/Header.css'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Container, Nav, Navbar } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const Header = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    // Logout user and redirect to home page
    const handleLogout = () => {
        auth.logout()
        navigate('/')
    }

    // Render navigation bar
    return (
        <div className='header'>
            <Navbar bg='dark' data-bs-theme='dark'>
                <Container>
                    <Navbar.Toggle aria-controls='basic-navbar-nav' />
                    <Navbar.Collapse id='basic-navbar-nav'>
                        <Nav>
                            {auth?.user
                                ? (
                                    <>
                                        {/* Render links for logged-in user */}
                                        <Nav.Link onClick={handleLogout}>
                                            Logout
                                        </Nav.Link>
                                        <Nav.Link href='/'>
                                            Own Drive
                                        </Nav.Link>
                                        <Nav.Link href='/shared-with-me'>
                                            Shared with me
                                        </Nav.Link>
                                        <Nav.Link href='/trash'>
                                            Trash
                                        </Nav.Link>
                                        <Nav.Link href='/profile'>
                                            Profile
                                        </Nav.Link>
                                    </>
                                )
                                : (
                                    <>
                                        {/* Render links for guest user */}
                                        <Nav.Link href='/login'>
                                            Login
                                        </Nav.Link>
                                        <Nav.Link href='/register'>
                                            Register
                                        </Nav.Link>
                                    </>
                                )
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    )
}

export default Header
