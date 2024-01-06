import React, { useState, useEffect } from "react";
import { UserAuth } from "context/AuthContext";
import api from "services/api";
import "../../components/Dropdown.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Footer from "components/Footers/Footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialState = {
  ime: "",
  priimek: "",
  telefon: "",
  naslov: "",
  posta: "",
  drzava: "",
  email: "",
  geslo: "geslo"
}

export default function Register() {
  const [showPassword, setShowPassword] = React.useState(false);

  const [user, setUser] = useState(initialState);
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const navigate = useNavigate();

  const { createUser } = UserAuth();

  const [uporabniki, setUporabniki] = useState([]);

  useEffect(() => {
    const fetchUporabnike = async () => {
      try {
        const response = await api.get('/uporabnik/vsi');
        setUporabniki(response.data);
      } catch (error) {
        console.error("Napaka pri pridobivanju uporabnikov", error);
      }
    };

    fetchUporabnike();
  }, []);

  const validateForm = () => {
    let formErrors = {};
    let formIsValid = true;

    if (!user.ime) {
      formIsValid = false;
      formErrors["ime"] = "Prosimo, vnesite ime.";
    }

    if (!user.priimek) {
      formIsValid = false;
      formErrors["priimek"] = "Prosimo, vnesite priimek.";
    }

    if (!user.telefon) {
      formIsValid = false;
      formErrors["telefon"] = "Prosimo, vnesite telefonsko stevilko.";
    }

    if (!user.naslov) {
      formIsValid = false;
      formErrors["naslov"] = "Prosimo, vnesite naslov.";
    }

    if (!user.posta) {
      formIsValid = false;
      formErrors["posta"] = "Prosimo, vnesite postno stevilko.";
    }

    if (!user.drzava) {
      formIsValid = false;
      formErrors["drzava"] = "Prosimo, vnesite drzavo.";
    }

    if (!email) {
      formIsValid = false;
      formErrors["email"] = "Prosimo, vnesite email.";
    }

    for (let i = 0; i < uporabniki.length; i++) {
      if (uporabniki[i].email == email) {
        formIsValid = false;
        formErrors["email"] = "Ta email je ze v uporabi.";
      }
    }

    if (!password) {
      formIsValid = false;
      formErrors["geslo"] = "Prosimo, vnesite geslo.";
    }

    if (password && password.length < 6) {
      formIsValid = false;
      formErrors["geslo"] = "Prosimo, vnesite geslo z vsaj 6 znaki.";
    }
    setErrors(formErrors);
    return formIsValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (validateForm()) {
      setLoading(true);
      setIsSubmitting(true);

      try {
        user.email = email;

        const response = await api.post("/uporabnik/dodaj", user, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.status === 200) {
          toast.info(' Uspešno ste se registrirali!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }

        setUser(initialState);
        setErrors({});

        await createUser(email, password);

        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (er) {
        setError(er.message);
      }
    }
  }

  const handleChange = (e) => {
    const { value, name } = e.target;

    setUser((prevState) => {
      const nextState = {
        ...prevState,
        [name]: value,
      };
      return nextState;
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="fixed" style={{ top: "1rem", left: "1rem" }}>
        <Link to="/">
          <button
            className="bg-blueGray-800 text-white active:bg-blueGray-600 font-bold uppercase p-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
      </div>
      <br></br><br></br><br></br><br></br><br></br><br></br>
      <div className="container mx-auto px-4 pt-20">
        <div className="flex content-center items-center justify-center h-screen">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">
                    Ustvari si račun
                  </h6>
                </div>
                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form onSubmit={handleSubmit}>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="first_name"
                    >
                      Ime
                    </label>
                    <input
                      type="text"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Ime"
                      name="ime"
                      id="ime"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.ime}</small>
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="last_name"
                    >
                      Priimek
                    </label>
                    <input
                      type="text"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Priimek"
                      name="priimek"
                      id="priimek"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.priimek}</small>
                  </div>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="phone"
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Telefon"
                      name="telefon"
                      id="telefon"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.telefon}</small>
                  </div>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="adress"
                    >
                      Naslov
                    </label>
                    <input
                      type="text"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Naslov"
                      name="naslov"
                      id="naslov"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.naslov}</small>
                  </div>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="postal_code"
                    >
                      Poštna številka in pošta
                    </label>
                    <input
                      type="text"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Poštna številka in pošta"
                      name="posta"
                      id="posta"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.posta}</small>
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="country"
                    >
                      Država
                    </label>
                    <input
                      type="text"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Država"
                      name="drzava"
                      id="drzava"
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.drzava}</small>
                  </div>
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <small className="text-red-500">{errors.email}</small>
                  </div>

                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="password"
                    >
                      Geslo
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      className="border border-blueGray-300 bg-blueGray-100 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Geslo"
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={togglePasswordVisibility}
                      className="absolute right-0 text-blueGray-500"
                      style={{ top: "66%", paddingRight: "1rem", transform: "translateY(-50%)" }}
                      type="button"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </button>

                  </div>
                  <small className="text-red-500">{errors.geslo}</small>

                  <div className="text-center mt-6">
                    <button
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="submit"
                    >
                      Registriraj se
                    </button>
                  </div>
                  <div className="flex flex-wrap mt-6 relative">
                    <div className="w-1/2">
                      <Link to="/login" className="text-blueGray-800">
                        <small>Že imaš račun? Prijavi se!</small>
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
      {loading && isSubmitting && (
        <div className="flex justify-center">
          <div style={{ display: "flex", alignItems: "center" }}>
            <p style={{ textAlign: "center", marginRight: "10px" }}>Nalaganje...</p>
            {/* <div className="loader"></div> */}
          </div>
        </div>
      )}
      <Footer />
      <ToastContainer></ToastContainer>
    </>
  );
}