import { SearchX } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Display";

export default function AdminNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sayfa bulunamadı" />
      <EmptyState
        icon={SearchX}
        title="Bu yönetim sayfası yok"
        description="Adres yanlış yazılmış ya da sayfa taşınmış olabilir. Menüden devam edebilirsin."
        action={<LinkButton href="/admin">Gösterge paneline dön</LinkButton>}
      />
    </div>
  );
}
