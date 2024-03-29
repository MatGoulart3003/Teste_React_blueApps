import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import api from './Service/Api';
import TitleApp from './components/TitleApp';

function App() {
  const [id, setId] = useState(0);
  const [idEdited, setIdEdited] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setbody] = useState('');
  const [createbodyButton, setCreatebodyButton] = useState(false);
  const [anotationList, setAnotationList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const secondInput = useRef(null);

  const handleCreatebodyButton = () => {
    setCreatebodyButton(!createbodyButton);
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescricaoChange = (event) => {
    setbody(event.target.value);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Faz a rolagem suavemente
    });
  };

  const postAnotationBack = (newAnotation) => {
    api
      .post('/posts', { newAnotation })
      .then((response) => console.log(response))
      .catch((error) => console(error));
  };

  const addAnotation = () => {
    if (title && body) {
      let newAnotation = { id, title, body };
      if (isEditing) {
        const editedAnotation = { id: idEdited, title, body };
        const auxList = [...anotationList];
        const index = auxList.findIndex(
          (anotation) => anotation.id === idEdited
        );
        auxList.splice(index, 1, editedAnotation);
        setAnotationList([...auxList]);
        setIsEditing(false);
      } else {
        setAnotationList([...anotationList, newAnotation]);
        newAnotation = { id, title, body, userId: 1 };
        postAnotationBack(newAnotation);
        setId((id) => id + 1);
      }
      setTitle('');
      setbody('');
      handleCreatebodyButton();
      Swal.fire({
        icon: 'success',
        title: 'Dados salvos com sucesso!',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Campos vazios',
        text: 'Por favor, preencha o título e a descrição.',
        showConfirmButton: false,
        timer: 2200,
      });
    }
  };

  const deleteAnotationBack = (idAnotation) => {
    api
      .delete(`/posts/${idAnotation}`)
      .then((response) => {
        console.log('Anotação deletada', response);
      })
      .catch((error) => console.log('Erro!', error));
  };

  const deleteAnotation = (idAnotation) => {
    const auxList = [...anotationList];
    const index = auxList.findIndex(
      (anotation) => anotation.id === idAnotation
    );
    deleteAnotationBack(idAnotation);
    console.log(index);
    auxList.splice(index, 1);
    setAnotationList(auxList);
  };

  const editAnotationBack = (updatedAnotation) => {
    api
      .put(`/posts/${updatedAnotation.id}`, updatedAnotation)
      .then((response) => {
        console.log('Anotação editada', response);
      })
      .catch((error) => console.log('Erro!', error));
  };

  const editAnotation = (idAnotation) => {
    const auxList = [...anotationList];
    const index = auxList.findIndex(
      (anotation) => anotation.id === idAnotation
    );
    console.log(index);
    setTitle(anotationList[index].title);
    setbody(anotationList[index].body);
    setIdEdited(anotationList[index].id);
    editAnotationBack(anotationList[index]);
    handleScrollToTop();
    setIsEditing(true);
    console.log(index);
    handleCreatebodyButton();
  };

  const getAnotationL = async () => {
    try {
      const response = await api.get('/posts');
      const formattedData = response.data
        .filter((item) => item.userId === 1)
        .map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
        }));
      setAnotationList(formattedData);
      if (formattedData.length > 0) {
        setId(formattedData[formattedData.length - 1].id + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      addAnotation();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      secondInput.current.focus();
    }
  };

  useEffect(() => {
    getAnotationL();
  }, []);

  return (
    <div className="bg-indigo-200 p-1.5 m-10 rounded-lg">
      <TitleApp />
      <div className="lg:text-center bg-indigo-300 p-1.5 m-10 rounded-lg">
        {!createbodyButton && (
          <button
            type="button"
            className="m-5 rounded-md bg-indigo-600 px-10 py-1.5 text-center text-lg font-semibold
       text-white hover:bg-indigo-500"
            onClick={handleCreatebodyButton}
          >
            {' '}
            Criar Anotação
          </button>
        )}

        {createbodyButton && (
          <div className="mx-auto max-w-2xl lg:text-center p-6 py-1.5">
            <form>
              <label className="block text-lg m-5 font-medium leading-6 text-gray-900">
                Titulo:
                <input
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onKeyDown={handleKeyDown}
                />
              </label>
              <label className="block text-lg m-5 font-medium leading-6 text-gray-900">
                Descrição:
                <input
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  ref={secondInput}
                  value={body}
                  onChange={handleDescricaoChange}
                  onKeyDown={handleKeypress}
                />
              </label>
              <button
                className="m-5 rounded-md bg-indigo-600 px-10 py-1.5 text-center text-lg font-semibold
        text-white hover:bg-indigo-500"
                type="button"
                onClick={addAnotation}
              >
                {' '}
                Salvar{' '}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className=" bg-red-600 py-1.5 m-10 rounded-lg ">
        <div className="mx-auto max-w-2xl lg:text-center p-6">
          <h1 className="mt-2 font-bold text-blue-700 text-2xl">
            Lista de Anotações
          </h1>
        </div>
        <ul className="px-20 divide-y divide-blue-700 ">
          {anotationList.map((item, index) => (
            <li key={index} className="flex justify-between gap-x-6 py-5">
              <div className="min-w-0 flex-auto ">
                <p className="text-xl font-bold text-gray-900">{item.title}</p>
                <p className="text-lg text-gray-700">{item.body}</p>
              </div>

              <button
                className="rounded-md bg-indigo-400 px-10 py-1.5 text-center text-lg font-semibold
        text-white hover:bg-indigo-500"
                type="button"
                onClick={() => editAnotation(item.id)}
              >
                {' '}
                Editar{' '}
              </button>
              <button
                className="rounded-md bg-indigo-500 px-10 py-1.5 text-center text-lg font-semibold
        text-white hover:bg-indigo-500"
                type="button"
                onClick={() => deleteAnotation(item.id)}
              >
                {' '}
                Remover{' '}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
