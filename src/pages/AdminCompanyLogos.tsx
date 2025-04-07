
import { CompanyLogoManager } from '@/components/CompanyLogoManager';

const AdminCompanyLogos = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Company Logos</h2>
        <p className="text-muted-foreground">
          Manage company logos that appear on your site.
        </p>
      </div>
      <CompanyLogoManager />
    </div>
  );
};

export default AdminCompanyLogos;
