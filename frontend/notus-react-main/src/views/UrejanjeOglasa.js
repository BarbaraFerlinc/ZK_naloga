import React, { useState, useEffect } from "react";
import { UserAuth } from "context/AuthContext";
import api from "services/api";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import { useNavigate } from "react-router-dom";
import { HighlightSpanKind } from "typescript";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../components/Dropdown.css";

const initialState = {
    naslov: "",
    velikost: "XS",
    opis: "",
    cena: 0,
    lokacija: "",
    za_zamenjavo: 0,
    slika: [],
    fk_uporabnik_id: 0,
    fk_kategorija_id: 1,
}

export default function UrejanjeOglasa({ seznamOglasov, onEdit }) {

    const { id } = useParams();
    let parsan_id;
    if (id !== undefined) {
        parsan_id = parseInt(id, 10);
    } else {
        parsan_id = undefined;
    }

    let izbira = seznamOglasov.find((i) => i.id === parsan_id);

    initialState.naslov = izbira?.naslov;
    initialState.velikost = izbira?.velikost;
    initialState.opis = izbira?.opis;
    initialState.cena = izbira?.cena;
    initialState.lokacija = izbira?.lokacija;
    initialState.za_zamenjavo = izbira?.za_zamenjavo;
    initialState.fk_uporabnik_id = izbira?.fk_uporabnik_id;
    initialState.fk_kategorija_id = izbira?.fk_kategorija_id;

    const [oglas, setOglas] = useState(initialState);
    const [errors, setErrors] = useState({ slika: [] });
    const [kategorija, setKategorija] = useState([]);
    const [zamenjava, setZamenjava] = useState(initialState.za_zamenjavo);
    const [uporabnikovId, setUporabnikovId] = useState(0)
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [naslovCount, setNaslovCount] = useState(0);
    const [opisCount, setOpisCount] = useState(0);

    const { user } = UserAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user.email) {
            const uporabnikovEmail = user.email;

            api.post('uporabnik/prijavljen-uporabnik', { email: uporabnikovEmail })
                .then(res => {
                    const userId = res.data.userId;
                    setUporabnikovId(userId);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [user.email]);

    useEffect(() => {
        const fetchKategorije = async () => {
            try {
                const response = await api.get('/kategorija/vsi');
                setKategorija(response.data);
            } catch (error) {
                console.error("Napaka pri pridobivanju kategorij", error);
            }
        };

        fetchKategorije();
    }, []);

    const velikosti = [
        { naziv: 'XS' },
        { naziv: 'S' },
        { naziv: 'M' },
        { naziv: 'L' },
        { naziv: 'XL' },
        { naziv: 'XXL' },
        { naziv: '110' },
        { naziv: '116' },
        { naziv: '122' },
        { naziv: '128' },
        { naziv: '134' },
        { naziv: '140' },
        { naziv: '146' },
        { naziv: '152' },
        { naziv: '158' },
        { naziv: '164' },
    ];

    const validateForm = () => {
        let formErrors = {};
        let formIsValid = true;

        if (!oglas.naslov) {
            formIsValid = false;
            formErrors["naslov"] = "Prosimo, vnesite naslov oglasa.";
        }

        if (!oglas.opis) {
            formIsValid = false;
            formErrors["opis"] = "Prosimo, vnesite opis oglasa.";
        }

        if (!oglas.velikost) {
            formIsValid = false;
            formErrors["velikost"] = "Prosimo, izberite velikost.";
        }

        if (!oglas.fk_kategorija_id) {
            formIsValid = false;
            formErrors["fk_kategorija_id"] = "Prosimo, izberite kategorijo.";
        }

        if (!oglas.cena || oglas.cena <= 0 || oglas.cena > 1000) {
            formIsValid = false;
            formErrors["cena"] = "Prosimo, vnesite veljavno ceno (med 1 in 1000).";
        }

        if (!oglas.lokacija) {
            formIsValid = false;
            formErrors["lokacija"] = "Prosimo, vnesite lokacijo.";
        }

        setErrors(formErrors);
        return formIsValid;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            setIsSubmitting(true);

            try {
                const formData = new FormData();
                formData.append("naslov", oglas.naslov);
                formData.append("velikost", oglas.velikost);
                formData.append("opis", oglas.opis);
                formData.append("cena", Number(oglas.cena));
                formData.append("lokacija", oglas.lokacija);
                formData.append("za_zamenjavo", oglas.za_zamenjavo);
                formData.append("fk_uporabnik_id", oglas.fk_uporabnik_id);
                formData.append("fk_kategorija_id", oglas.fk_kategorija_id);

                if (izbira.slike.length > 0 && oglas.slika.length === 0) {
                    formData.append("slikeNespremenjene", 'true');
                } else {
                    if (Array.isArray(oglas.slika)) {
                        oglas.slika.forEach((slika) => {
                            formData.append("slika", slika);
                        });
                    } else {
                        formData.append("slika", oglas.slika);
                    }
                }
                for (const entry of formData.entries()) {
                }
                const response = await api.put(`/artikel/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.status === 200) {
                    toast.success(' Uspešno ste uredili oglas!', {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });


                } else {
                    toast.error(' Napaka pri urejanju oglasa!', {
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

                setTimeout(() => {
                    navigate('/');
                }, 3000);

                setErrors({});
            } catch (error) {
                setLoading(false)
                setIsSubmitting(false)
                toast.error(' Napaka pri objavi oglasa za zamenjavo!', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                console.error("Napaka pri posredovanju zahteve POST", error);
                let errorMessages = {};
                if (error.response && error.response.data && error.response.data.error) {
                    errorMessages["slika"] = error.response.data.error;
                } else {
                    errorMessages["slika"] = "Napaka pri objavi oglasa!";
                }

                setErrors(errorMessages);

            }
            onEdit(oglas);
        }
    };

    const handleChange = (e) => {
        const { value, name, type, checked } = e.target;
        let valueToUse = value;

        if (type === "checkbox" && name === "za_zamenjavo") {
            valueToUse = checked ? 1 : 0;
            setZamenjava(valueToUse);
        } else if (name === "fk_kategorija_id") {
            const selectedKategorija = kategorija.find((k) => k.id === value);
            if (selectedKategorija) {
                valueToUse = selectedKategorija.id;
            }
        }

        setOglas((prevState) => {
            const nextState = {
                ...prevState,
                [name]: valueToUse,
                fk_uporabnik_id: uporabnikovId,
            };
            return nextState;
        });

        if (name === "naslov") {
            setNaslovCount(value.length);
        }

        if (name === "opis") {
            setOpisCount(value.length);
        }
    };

    const handleFileChange = (e) => {
        let fileErrors = [];
        let files = Array.from(e.target.files);

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                fileErrors.push(`Datoteka "${file.name}" ni veljavna slika.`);
            }
        });

        if (fileErrors.length > 0) {
            setErrors(prevState => ({ ...prevState, slika: fileErrors }));
        } else {
            setOglas({
                ...oglas,
                slika: files
            });
            setErrors(prevState => ({ ...prevState, slika: [] }));
        }
    }

    if (uporabnikovId !== oglas.fk_uporabnik_id) {
        navigate('/');
    }

    return (
        <>
            <IndexNavbar />
            <br></br>

            <div className="container mx-auto px-4 pt-20">
                <div className="flex content-center items-center justify-center h-screen">
                    <div className="w-full lg:w-6/12 px-4">
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                            <div className="rounded-t mb-0 px-6 py-6">
                                <div className="text-center mb-3">
                                    <h1 className="text-blueGray-500 font-bold">
                                        Urejanje oglasa
                                    </h1>
                                </div>
                                <hr className="mt-6 border-b-1 border-blueGray-300" />
                            </div>
                            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                                <div className="text-blueGray-400 text-center mb-3 font-bold">
                                    <small>Vnesite nove podatke o oglasu</small>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="relative w-full mb-3">
                                        <div class="w-full"><label class="inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="za_zamenjavo" id="za_zamenjavo" value={oglas.za_zamenjavo} checked={oglas.za_zamenjavo === 1} onChange={handleChange} disabled={isSubmitting} class="form-checkbox appearance-none ml-1 w-5 h-5 ease-linear transition-all duration-150 border border-blueGray-300 rounded checked:bg-blueGray-700 checked:border-blueGray-700 focus:border-blueGray-300" />
                                            <span class="ml-2 text-sm font-semibold text-blueGray-500">Ponujam tudi zamenjavo</span></label></div>
                                    </div>

                                    <div className="relative w-full mb-3">
                                        <label
                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                            htmlFor="naslov"
                                        >
                                            Naslov
                                        </label>
                                        <input
                                            type="text"
                                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                            placeholder="Naslov"
                                            name="naslov" id="naslov" value={oglas.naslov} onChange={handleChange}
                                            disabled={isSubmitting}
                                            maxLength={50}
                                        />
                                        <small className="text-red-500">{errors.naslov}</small>
                                        <small className="text-gray-500">{`${naslovCount}/50`}</small>

                                    </div>
                                    <div className="relative w-full mb-3">
                                        <label
                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                            htmlFor="grid-password"
                                        >
                                            Opis
                                        </label>
                                        <input type="text" placeholder="Opis" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base shadow outline-none focus:outline-none focus:shadow-outline w-full" ž
                                            name="opis" id="opis" value={oglas.opis} onChange={handleChange}
                                            disabled={isSubmitting}
                                            maxLength={300}
                                        />
                                        <small className="text-red-500">{errors.opis}</small>
                                        <small className="text-gray-500">{`${opisCount}/300`}</small>
                                    </div>
                                    <br></br>
                                    <div className="flex justify-between">
                                        <div className="w-1/2 px-2">
                                            <div className="relative w-full mb-3">
                                                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="velikost">
                                                    Velikost
                                                </label>
                                                <select
                                                    name="velikost"
                                                    id="velikost"
                                                    value={oglas.velikost}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                >
                                                    {velikosti.map((v, index) => (
                                                        <option key={index} value={v.naziv}>{v.naziv}</option>
                                                    ))}
                                                </select>
                                                <small className="text-red-500">{errors.velikost}</small>
                                            </div>
                                        </div>
                                        <div className="w-1/2 px-2">
                                            <div className="relative w-full mb-3">
                                                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="kategorija">
                                                    Kategorija
                                                </label>
                                                <select
                                                    name="fk_kategorija_id"
                                                    id="fk_kategorija_id"
                                                    value={oglas.fk_kategorija_id}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                >
                                                    {kategorija.map((k, index) => (
                                                        <option key={index} value={k.id}>{k.naziv}</option>
                                                    ))}
                                                </select>
                                                <small className="text-red-500">{errors.kategorija}</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        < div className="w-1/2 px-2">
                                            <div className="relative w-full mb-3">
                                                <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                                                    {zamenjava ? 'Okvirna cena v €' : 'Cena v €'}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                    placeholder={zamenjava ? 'Okvirna cena v €' : 'Cena v €'}
                                                    name="cena" id="cena" value={oglas.cena} onChange={handleChange}
                                                    disabled={isSubmitting}
                                                />
                                                <small className="text-red-500">{errors.cena}</small>
                                            </div>
                                        </div>
                                        < div className="w-1/2 px-2">
                                            <div className="relative w-full mb-3">
                                                <label
                                                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                    htmlFor="grid-password"
                                                >
                                                    Lokacija
                                                </label>
                                                <input
                                                    type="text"
                                                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                    placeholder="Lokacija"
                                                    name="lokacija" id="lokacija" value={oglas.lokacija} onChange={handleChange}
                                                    disabled={isSubmitting}
                                                />
                                                <small className="text-red-500">{errors.lokacija}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative w-full mb-3">
                                        <label
                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                            htmlFor="slike"
                                        >
                                            Slike
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            id="slika"
                                            name="slika"
                                            onChange={handleFileChange}
                                            disabled={isSubmitting}
                                            className="border-0 px-3 py-3 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                        />
                                        <small className="text-red-500">
                                            {Array.isArray(errors.slika) ? errors.slika[0] : errors.slika}
                                        </small>

                                    </div>
                                    <small>
                                        <b>Vaše trenutne slike so: </b>{oglas?.slika.length > 0 ? oglas?.slika?.map((slika, index) => (
                                            <p> Slika {index + 1}: {slika.name} </p>
                                        )) : izbira?.slike?.map((slika, index) => (
                                            <p> Slika {index + 1}: {slika.split("/").pop()}</p>
                                        ))}
                                    </small>
                                    <div className="text-center mt-6">
                                        <button
                                            className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                                            type="submit"
                                        >
                                            Objavi
                                        </button>
                                    </div>
                                </form>
                                {loading && isSubmitting && (
                                    <div className="flex justify-center">
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <p style={{ textAlign: "center", marginRight: "10px" }}>Nalaganje...</p>
                                            <div className="loader"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br></br>
            <Footer />
            <ToastContainer />
        </>
    )
}