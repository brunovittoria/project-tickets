import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlusCircle } from 'react-icons/fi'
import { useState, useEffect, useContext } from 'react'

import { AuthContext } from '../../contexts/auth'
import { db } from '../../services/firebaseConnection'
import {collection, getDocs, getDoc, doc, addDoc} from 'firebase/firestore'

import { useParams } from 'react-router-dom'

import { toast } from 'react-toastify'

import './new.css'

const listRef = collection(db, "customers")

export default function New(){
    const { user } = useContext(AuthContext)
    const { id } = useParams()

    const [customers, setCustomers] = useState([])
    const [loadCustomers, setloadCustomers] = useState(true)
    const [customerSelected, setcustomerSelected] = useState(0)

    const [complemento, setComplemento] = useState('')
    const [assunto, setAssunto] = useState('Suporte')
    const [status, setStatus] = useState('Aberto')
    const [idCustomer, setIdCustomer] = useState(false)

    useEffect(() => {
        console.log(id)

        async function loadCustomers(){
            const querySnapshot = await getDocs(listRef)
            .then( (snapshot) => {
                let lista = []

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                })

                if(snapshot.docs.size === 0){
                    console.log("Nenhuma Empresa ENCONTRADA")
                    setCustomers([ { id: '1', nomeFantasia: 'FREELA'}])
                    setloadCustomers(false)
                    return
                }

                setCustomers(lista)
                setloadCustomers(false)

                if(id){
                    loadId(lista)
                }

            })

            .catch((error) => {
                console.log("Erro ao buscar CLIENTES", error)
                setloadCustomers(false)
                setCustomers([ { id: '1', nomeFantasia: 'FREELA'} ])
            })
        }

        loadCustomers()

    }, [id])

    async function loadId(lista){
        const docRef = doc(db,"chamados", id)
        await getDoc(docRef)
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplemento(snapshot.data().complemento)

            let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setcustomerSelected(index)
            setIdCustomer(true)

        })
        .catch((error) => {
            console.log(error)
            setIdCustomer(false)
        })
    }

    function handleOptionChange(e){
        setStatus(e.target.value)
    }

    function handleChangeSelect(e){
        setAssunto(e.target.value)
        console.log(e.target.value)
    }

    function handleChangeSelected(e){
        setcustomerSelected(e.target.value)
    }

    async function handleRegister(e){
        e.preventDefault()

        if(idCustomer){
            alert("EDITANDO CHAMADO")
            return
        }

        //Registrar um chamado
        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
        })
        .then(() => {
            toast.success("Chamado registrado!")
            setComplemento('')
            setcustomerSelected(0)
        })
        .catch((error) => {
            toast.error("Ops erro ao registrar, tente mais tarde!")
            console.log(error)
        })

    }

    return(
        <div>
            <Header/>

            <div className='content'>
                <Title name="Novo Chamado">
                    <FiPlusCircle size={25}/>
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>
                        <label>Clientes</label>
                        {
                            loadCustomers ? (
                                <input type='text' disabled={true} value="Carregando..." />
                            ) : (
                                <select value={customerSelected} onChange={handleChangeSelected}>
                                    {customers.map((item, index) => {
                                        return(
                                            <option key={index} value={index}>
                                              {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Tecnica">Visita Tecnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input type='radio' name='radio' value="Aberto" onChange={handleOptionChange} checked={status === 'Aberto'}/>
                            <span>Em aberto</span>

                            <input type='radio' name='radio' value="Progresso" onChange={handleOptionChange} checked={status === 'Progresso'}/>
                            <span>Progresso</span>

                            <input type='radio' name='radio' value="Atendido" onChange={handleOptionChange} checked={status === 'Atendido'}/>
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea 
                        type="text" 
                        placeholder='Descreva seu problema (opcional)' 
                        value={complemento} 
                        onChange={ (e) => setComplemento(e.target.value)}
                        />
                        
                        <button type='submit'>Registrar</button>
                    </form>

                </div>
            </div>
        </div>
    )
}