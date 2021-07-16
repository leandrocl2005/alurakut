import MainGrid from '../src/components/MainGrid';
import Box from '../src/components/Box';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';
import {
  AlurakutMenu,
  AlurakutProfileSidebarMenuDefault,
  OrkutNostalgicIconSet
} from '../src/lib/AlurakutCommons';
import { useState, useEffect } from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';


function ProfileSidebar({ githubUsername }) {

  return (
    <Box as="aside">
      <img
        style={{ borderRadius: '8px' }}
        src={`https://github.com/${githubUsername}.png`}
        alt="User Photo"
      />
      <hr />
      <p>
        <a className="boxLink" href={`https://github.com/${githubUsername}`}>
          @{githubUsername}
        </a>
      </p>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  );
}


export default function Home({ githubUser }) {

  const githubUsername = githubUser;

  const [followers, setFollowers] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [comunidadesContador, setComunidadesContador] = useState(0);
  const [countFollowers, setCountFollowers] = useState(0);

  useEffect(() => {
    async function loadFollowers() {
      const response = await fetch(`https://api.github.com/users/${githubUser}/followers`);
      const data = await response.json()
      setCountFollowers(data.length);
      setFollowers(data.slice(0, 6));
    }

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': 'f428a08a0b17a2ebfe02fc45555832',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "query": `query {
          allCommunities (
            filter: {
              creatorSlug: { eq: "${githubUser}" }
            }
          ) 
          {
            title
            id
            creatorSlug
            image
          }
      }` })
    })
      .then((response) => response.json())
      .then((respostaCompleta) => {
        const comunidadesVindasDoDato = respostaCompleta.data.allCommunities;
        console.log(comunidadesVindasDoDato);
        setComunidadesContador(comunidadesVindasDoDato.length);
        setComunidades(comunidadesVindasDoDato);
      })

    loadFollowers();
  }, [githubUser])

  const handleCreateCommunity = async (event) => {

    event.preventDefault();

    const data = new FormData(event.target);

    if (!data.get("title") || !data.get("image")) {
      alert("Preencha todos os campos do formulário");
      return;
    }

    fetch('/api/comunidades', {
      method: "POST",
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        title: data.get("title"),
        image: data.get("image"),
        creatorSlug: githubUser
      })
    })
      .then(response => response.json())
      .then(data => {
        setComunidades([data.dados, ...comunidades])
        setComunidadesContador(comunidadesContador + 1)
      })


  }

  return (
    <>
      <AlurakutMenu githubUser={githubUser} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: "profileArea" }}>
          <ProfileSidebar githubUsername={githubUser} />
        </div>
        <div className="welcomeArea" style={{ gridArea: "welcomeArea" }}>
          <Box>
            <h1 className="title">Bem vindo(a)</h1>
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>

            <form onSubmit={handleCreateCommunity}>
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  area-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  area-label="Coloque uma URL para usarmos de capa"
                />
              </div>

              <button>Criar comunidade</button>
            </form>
          </Box>
        </div>
        <div className="profileRelationsArea" style={{ gridArea: "profileRelationsArea" }}>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidadesContador})
            </h2>
            <ul>
              {comunidades.length >= 6 ? comunidades.slice(0, 6).map((comunidade) => {
                return (
                  <li key={comunidade.id}>
                    <a href={`/comunidade/${comunidade.title}`} >
                      <img src={comunidade.image} />
                      <span>{comunidade.title}</span>
                    </a>
                  </li>
                );
              }) : comunidades.map((comunidade) => {
                return (
                  <li key={comunidade.id}>
                    <a href={`/comunidade/${comunidade.title}`} >
                      <img src={comunidade.image} />
                      <span>{comunidade.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Seguidores ({countFollowers})
            </h2>
            <ul>
              {followers.map((follower) => {
                return (
                  <li key={follower.id}>
                    <a href={`/follower/${follower.login}`}>
                      <img src={follower.avatar_url} />
                      <span>{follower.login}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const cookies = nookies.get(ctx);
  const token = cookies.USER_TOKEN;
  const decodedToken = jwt.decode(token);
  const githubUser = decodedToken?.githubUser;

  if (!githubUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {
      githubUser,
    }
  }
}
