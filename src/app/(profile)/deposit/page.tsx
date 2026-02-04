import Deposit from "@/components/app/deposit";
import { _UserRole } from "@/features/auth/const";

export default function DepositPage() {
  return <Deposit useFor={_UserRole.CUSTOMER} />;
}
