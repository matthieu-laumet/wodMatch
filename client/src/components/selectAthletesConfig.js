import GetAvatar from "./GetAvatar";
import { components } from 'react-select';

export const optionsUsersFonction = (users) => {
  return users.map(user => {
    const label = `${user.last_name.toUpperCase()} ${user.first_name}`;
    const avatar = user?.avatar ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${label.replace(/ /g,'')}`
    const club = user.club_name;
    const { first_name, last_name } = user;
    return { label, value: user.id, id: user.id, id_user: user.id, avatar, club, first_name, last_name }
  })
}  


// Permet de styliser les options et de rajouter un avatar et le nom du club
export const Option = ({ children, ...props }) => {  
  const { innerProps, innerRef } = props;
  const { label, avatar, club } = props.data;
  return (
    <div ref={innerRef} {...innerProps} className={'user-register-select-container'}>
      <GetAvatar filename={avatar} fullname={avatar} className="avatar-register" />
      <div className="user-register-select-content">
        <p className="user-register-label">{label}</p>
        <p className="user-register-club">{club}</p>
      </div>
    </div>
  );
};

export const customFilter = (option, input) => {
  const { first_name, last_name } = option;
  const searchInput = input?.toLowerCase()?.trim();
  
  if (`${last_name} ${first_name}`?.toLowerCase()?.includes(searchInput)) {
    return true;
  }
  if (`${first_name} ${last_name}`?.toLowerCase()?.includes(searchInput)) {
    return true;
  }
  return false;
};

// Permet d'afficher la valeur Selectionnée
export const SingleValue = ({ children, ...props }) => {
  const { label, avatar, club } = props.data;
  return (
    <div className={'user-register-select-container selected'}>
      <GetAvatar filename={avatar} fullname={avatar} className="avatar-register" />
      <div className="user-register-select-content">
        <p className="user-register-label">{label}</p>
        <p className="user-register-club">{club}</p>
      </div>
    </div>
  );
};


// Permet de limiter le nombre maximum d'options à afficher
export const MenuList = ({ children, ...props }) => {
  const { maxOptions } = props.selectProps;
  return (
    <components.MenuList {...props}>
      {Array.isArray(children) ? children.slice(0, maxOptions) : children}
    </components.MenuList>
  );
};