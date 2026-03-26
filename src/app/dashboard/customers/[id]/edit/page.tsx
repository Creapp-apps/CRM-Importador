import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTenantUser } from "@/lib/tenant";
import EditCustomerForm from "./edit-form";

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) return notFound();

  const customer = await prisma.customer.findUnique({
    where: { id: params.id, tenantId: tenantUser.tenantId },
  });

  if (!customer) return notFound();

  return <EditCustomerForm initialData={customer} />;
}
