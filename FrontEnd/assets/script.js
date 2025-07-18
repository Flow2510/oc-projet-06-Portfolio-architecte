let allWorks = [];  // on declare un nouveau tableau pour utilisé la variable works globalement
const token = localStorage.getItem('authToken');    //    on stock et verifie si on a un token ici

const projectContainer = document.querySelector('.gallery');
const categorysWrapper = document.querySelector('.filters__wrapper');
const previewWrapper = document.querySelector('.add__preview');
const previewImageWrapper = document.querySelector('.add__preview-image-wrapper');
const previewError = document.querySelector('.add__preview-error');
const inputError = document.querySelector('.add__input-error');
const selectError = document.querySelector('.add__select-error');
const modalAddButton = document.querySelector('.modal__add-button');
const modalAddInput = document.querySelector('.modal__add-input');
const modalAddSelect = document.querySelector('.modal__add-select');
const wrapper = document.querySelector('.add__preview-wrapper');
const buttonLogin = document.querySelector('.login__button');
const inputEmail = document.querySelector('.login__input-email');
const inputPassword = document.querySelector('.login__input-password');
const emailError = document.querySelector('.login__error-email');
const passwordError = document.querySelector('.login__error-password');
    
async function chargingProject(){           //  fonction pour afficher les projets
    try {                   
        const response = await fetch('http://localhost:5678/api/works');  // on demande a l'api

        if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const works = await response.json();           // on recupere la reponse de l'api au format json
        allWorks = works;
    } catch(error){
         console.error('Erreur lors de la récupération des données :', error);
    }
}

async function showFilters() {              //  fonction pour afficher les filtres
    try{
        const response = await fetch('http://localhost:5678/api/categories');       // on demande a l'api

        if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const allButton = document.createElement('button');         // creation du bouton Tous
        allButton.innerText = "Tous";
        allButton.classList.add('filter');
        categorysWrapper.appendChild(allButton);
        
        allButton.addEventListener('click', () => {
            projectContainer.innerHTML = "";
            const filters = document.querySelectorAll('.filter');
            filters.forEach(f => {f.classList.remove('filter__selected')});
            allButton.classList.add('filter__selected');
            showProjects(allWorks);
        })

        const categorys = await response.json();         // creation des boutons filtres
        for (let category of categorys){
            const button = document.createElement('button');
            button.classList.add('filter');
            button.innerText = category.name;
            button.dataset.id = category.id;
            categorysWrapper.appendChild(button);

            button.addEventListener('click', () => {    //  ajout d'un event sur les boutons
                projectContainer.innerHTML = "";
                const categoryId = parseInt(button.dataset.id);   //  on convertit la chaine de caracteres en nombre (me fait trop souvent galerer)
                const filteredWorks = allWorks.filter(            //  on creer une varaiable avec les projet filtrés via .filter(parametre du filtre)
                    work => work.categoryId === categoryId
                );
                const filters = document.querySelectorAll('.filter');
                filters.forEach(f => {f.classList.remove('filter__selected')});
                button.classList.add('filter__selected');
                showProjects(filteredWorks);    //   on affiche que les projets filtrés
            })
        }   
    }   catch(error){
         console.error('Erreur lors de la récupération des données :', error);
    }
}

async function login() {                                        //    fonction pour se login
    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();
    const response = await fetch('http://localhost:5678/api/users/login', {         //    on demande a l'api
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email , password })                     //   transforme un objet js en chaine de caractere Json  pour communiquer avec l'api
    })

    if (!response.ok) {                                             //   si la reponse n'est pas OK => erreur
            alert("Identifiants invalides.");
        }

    const data = await response.json();                                 // attend la reponse de l'api qui va nous fournir un token si OK
    
    if (data.token) {                                   //    si ok, on enregistre le token dans le localstorage et retour a index
        localStorage.setItem('authToken', data.token);
        window.location.href = 'index.html';
    }
}

function showProjects(worksToShow) {     //   fonction pour afficher les projets dans la gallerie (on reprend le tableau worksToShow en parametre pour afficher que ce que je veux du tableau, je filtrai bien le tableau mais je reafficher a chaque fois TOUT les projets du coup je comprenais pas)
    projectContainer.innerHTML = "";
    for (let work of worksToShow) {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        img.src = work.imageUrl;
        figcaption.innerText = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        projectContainer.appendChild(figure);
    }
}

function showModalProject(){            // fonction pour afficher toutes les images des projets dans la galerie du modal
    const modalGallery = document.querySelector('.modal__gallery');    //   on vide la galerie a chaque fois pour les recharger
    modalGallery.innerHTML = "";

    for (let project of allWorks){
        const div = document.createElement('div');
        const i = document.createElement('i');
        const img = document.createElement('img');
        img.src = `${project.imageUrl}`;
        div.classList.add('modal__gallery-project');
        div.appendChild(img);
        i.classList.add('fa-regular');
        i.classList.add('fa-trash-can');
        div.appendChild(i);
        modalGallery.appendChild(div);
        i.addEventListener('click', async () => {           // addevent pour supprimer un projet via l'api avec project.id pour le numero du projet
            console.log(project.id);
            try{
                const response = await fetch(`http://localhost:5678/api/works/${project.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            if(!response.ok){
                throw new Error(`Erreur HTTP ${response.status}`);
            }            
            alert('Projet supprimé');
            await chargingProject();
            showModalProject();
            showProjects(allWorks);

            } catch (error){
                console.error('Erreur lors de l’envoi :', error);
            }
        })
    }
}

async function uploadProject(){       //  fonction pour ajouter un projet
    const addPreviewInput = document.querySelector('.add__preview-input');
    const newData = new FormData();         // creation d'un nouveau formulaire
    newData.append('image', addPreviewInput.files[0]); //ajout des données au formulaire
    newData.append('title', modalAddInput.value);
    newData.append('category', modalAddSelect.value);

    try{
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: newData
        });
    if(!response.ok){
        throw new Error(`Erreur HTTP ${response.status}`);
    } 

    const newProject = await response.json();
    console.log(newProject);
    alert('Projet upload');
    showProjects(allWorks);
    showModalProject();

    } catch (error){
         console.error('Erreur lors de l’envoi :', error);
    }
}

async function showOptions() {          // fonction pour afficher les categories dans le select
    const response = await fetch('http://localhost:5678/api/categories');

    if (!response.ok){                             // on gere les erreurs
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

    const categorys = await response.json();         
        for (let category of categorys){
            const select = document.querySelector('.modal__add-select');
            const option = document.createElement('option');
            option.classList.add('modal__add-option');
            option.value = `${category.id}`;
            option.innerText = `${category.name}`;
            select.appendChild(option);
        }
}

function clearPreview() {
    previewImageWrapper.innerHTML = "";
    previewWrapper.style.display = "";
}

function clearError(){
    previewError.style.display = '';
    wrapper.style.border = 'none';
    inputError.style.display = '';
    modalAddInput.style.border = 'none';
    selectError.style.display = '';
    modalAddSelect.style.border = 'none';
}

if (projectContainer) {
    (async () => {          
    await chargingProject();        //  on attend que la fonction ai fini de s'executer
    showProjects(allWorks);
    showFilters(); 
})();
}

if (buttonLogin) {
    buttonLogin.addEventListener('click', () => {
        const email = inputEmail.value.trim();
        const password = inputPassword.value.trim();
        
        if (email === "") {                                     // si l'input est vide on met une erreur
            inputEmail.style.border = "1px solid red";
            emailError.classList.add('login__error');
            emailError.innerText = 'Veuillez mettre une adresse email';
         } else if(password === "") {                           // si l'input est vide on met une erreur
            inputPassword.style.border = "1px solid red";
            passwordError.classList.add('login__error');
            passwordError.innerText = 'Veuillez remplir le mot de passe';
        } else {                                                //    reset des erreurs 
            inputEmail.style.border = "";               
            emailError.classList.remove('login__error');
            emailError.innerText = '';
            inputPassword.style.border = "";
            passwordError.classList.remove('login__error');
            passwordError.innerText = '';
            login();                                            //   appel de la fonction login
        }
    });
}

if (token){                 // si on a un token  =>
    const logout = document.querySelector('.header__login-index')
    logout.innerText = "logout";

    logout.addEventListener('click', function(event) {          //    event pour se deco si on a un token
        event.preventDefault();
        localStorage.removeItem("authToken");
        window.location.reload();
    })

    const editBanner = document.querySelector('.edit');         //   affichage du modal
    const portfolioEdit = document.querySelector('.portfolio__edit')
    const modal = document.querySelector('.modal');
    const header = document.querySelector('header');
    header.style.paddingTop = "20px"
    portfolioEdit.style.display = "flex";
    editBanner.style.display = "flex";
    categorysWrapper.style.visibility = "hidden";
    portfolioEdit.addEventListener('click', () => {
        modal.style.display = 'flex';
        showModalProject();
    })

    modal.addEventListener('click', (f) => {      // fermeture du modal au click en dehors du modal
        if (f.target === modal){
            modal.style.display= "none";
            modalGalleryWrapper.style.display = "block";
            modalAddWrapper.style.display = "";
            clearError();
            form.reset();
            clearPreview();
        }
    })

    const modalGalleryClose = document.querySelector('.modal__gallery-close');
    if (modalGalleryClose){
        modalGalleryClose.addEventListener('click', () => {
            modal.style.display = "none";
        })
    }

    const modalGalleryButton = document.querySelector('.modal__gallery-button');
    const modalGalleryWrapper = document.querySelector('.modal__gallery-wrapper')
    const modalAddWrapper = document.querySelector('.modal__add-wrapper')
    if (modalGalleryButton){
        modalGalleryButton.addEventListener('click', () => {
            modalGalleryWrapper.style.display = "none";
            modalAddWrapper.style.display = "block";
            document.querySelector('.modal__add-select').innerHTML = `<option class="modal__add-option" value="" disabled selected></option>`;
            showOptions();
        })
    }

    const form = document.querySelector('.modal__add-form')
    const modalAddClose = document.querySelector('.modal__add-close');
    if (modalAddClose){
        modalAddClose.addEventListener('click', () => {
            modal.style.display = "none";
            modalGalleryWrapper.style.display = "block";
            modalAddWrapper.style.display = "";
            clearPreview();
            clearError();
        })
    }

    const modalAddReturn = document.querySelector('.modal__add-return');
    if (modalAddReturn){
        modalAddReturn.addEventListener('click', () => {
            modalGalleryWrapper.style.display = "block";
            modalAddWrapper.style.display = "";
            form.reset();
            clearPreview();
            clearError();
        })
    }
    
    const addPreviewButton = document.querySelector('.add__preview-button');
    const addPreviewInput = document.querySelector('.add__preview-input');

    if (addPreviewButton && addPreviewInput) {

        addPreviewInput.addEventListener('change', function(event) {   //  affichage de la previsualisation de l'input
            const file = event.target.files[0];         //  on selectionne le fichier dans l'input
            if (!file) return;

            previewImageWrapper.innerHTML = "";     // Vider l'image précédente

            const reader = new FileReader();        // API native pour lire les fichier upload par l'utilisateur
            reader.onload = function(e) {           // une fois que l'image a chargé
                previewWrapper.style.display = "none";
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('add__preview-image');
                previewImageWrapper.appendChild(img);
            };
            reader.readAsDataURL(file);   //  lire l'image
        });

        addPreviewButton.addEventListener('click', (f) => {
            f.preventDefault();  //  resoud le bug de la disparition du modal au clique 
            addPreviewInput.click();
        });
    }

    if (modalAddButton){
        modalAddButton.addEventListener('click', function (event) {
            event.preventDefault();

            if(modalAddInput.value === '') {
                modalAddInput.style.border = '1px solid red';
                inputError.style.display = 'block';
            } else{
                modalAddInput.style.border = '';
                inputError.style.display = '';
            }

            if (modalAddSelect.value === ""){
                modalAddSelect.style.border = '1px solid red';
                selectError.style.display = 'block';
            } else {
                modalAddSelect.style.border = '';
                selectError.style.display = '';
            }

            
            if (addPreviewInput.files.length === 0){
                wrapper.style.border = '1px solid red';
                previewError.style.display = 'block';
            } else {
                wrapper.style.border = '';
                previewError.style.display = '';
            }

            if(modalAddSelect.value !== "" && modalAddInput.value !== '' && addPreviewInput.files.length > 0){  // si l'input a une image, un titre, et categorie selectionné =>
                uploadProject();
                form.reset();
                showModalProject();
                showProjects(allWorks);
                clearError();
            }
        })
    }
}