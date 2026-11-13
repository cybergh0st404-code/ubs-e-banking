import SuperAdminLogin, { getServerSideProps as superAdminSSP } from '../../super-admin/[slug]/login';

export const getServerSideProps = superAdminSSP;
export default SuperAdminLogin;

