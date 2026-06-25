import { useNavigate } from "react-router-dom";
import { useDeleteBlockedUserMutation, useGetBlockedAthletsQuery } from "../../slices/usersApiSlice";
import { PulseLoader } from "react-spinners";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const dateOptions = { locale: fr, timeZone: 'Europe/Berlin' }

export default function BlockAthletes() {
  const { data: blockAthletes, isLoading, isError, isSuccess } = useGetBlockedAthletsQuery();

  const navigate = useNavigate();
  const [deleteBlockedUser] = useDeleteBlockedUserMutation();

  const handlePrev = () => {
    window.scroll(0, 0);
    navigate('/profil/settings')
  };

  const handleDelete = async (contact) => {
    try {
      await deleteBlockedUser({ id_user_blocked: contact.id_user_blocked, blocked_email: contact.blocked_email })
    } catch (error) {
      console.log(error)
    }
  }

  // Grouper par première lettre du nom
  const groupedContacts = blockAthletes?.reduce((acc, contact) => {
    const letter = contact.contact_fullname?.charAt(0).toUpperCase() || '#';
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  // Trier les lettres alphabétiquement
  const sortedLetters = groupedContacts ? Object.keys(groupedContacts).sort() : [];

  return (
    <div className='full-screen padding pt-6'>
      <i className="bi bi-arrow-left-circle text-3xl cursor-pointer" onClick={handlePrev}></i>
      <div className="mt-2 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Bloquer des Athlètes</h2>
        <p>On ne choisit pas ses partenaires de box, mais sur WodMatch si. Ajoute les emails des profils que tu veux éviter — promis, ils ne sauront jamais.</p>
      </div>

      <div className="contact-container mt-8">
        <button className="btn black py-4 px-10 text-lg" onClick={() => navigate('add-contact')}>Ajouter un contact</button>

        {isLoading && <PulseLoader color='#505050' size={8} className="ml-6 mt-16"/>}

        {isSuccess && sortedLetters.map(letter => (
          <div key={letter} className="mt-10">
            <p className="font-semibold text-lg mb-2 pb-2 border-b border-[#bebebe]">{letter}</p>
            <div>
              {groupedContacts[letter].map(contact => (
                <div key={contact.id_blocked_user_contact} className="flex justify-between items-center py-3 border-b border-[#bebebe]">
                  <div>
                    <p className="font-semibold">{contact.contact_fullname}</p>
                    {contact.id_user_blocked 
                      ? <p className="text-sm opacity-60">{contact.club_name}</p>
                      : <p className="text-sm opacity-60">{contact.blocked_email}</p>
                    }
                    <p className="text-sm opacity-90 mt-2 font-medium">Ajouté le {format(new Date(contact.updated_at), 'dd/MM/yyyy', dateOptions)}</p>
                  </div>
                  <button className="btn unblock px-4 py-2 text-sm" onClick={() => handleDelete(contact)}>Débloquer</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}