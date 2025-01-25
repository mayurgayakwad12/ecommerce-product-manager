import Logo from '../assets/CompanyLogo.svg';

export const Header = () => (
  <header style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #D1D1D1' }}>
    <img src={Logo} style={{ paddingLeft: '1rem' }} />
    <h4 style={{ color: '#7E8185' }}>Monk Upsell & Cross-sell</h4>
  </header>
);
