import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTenantUser } from "@/lib/tenant";
import EditProductForm from "./edit-form";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) return notFound();

  const product = await prisma.product.findUnique({
    where: { id: params.id, tenantId: tenantUser.tenantId },
    include: {
      presentations: true,
    },
  });

  if (!product) return notFound();

  return <EditProductForm initialData={product} />;
}
