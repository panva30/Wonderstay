import { useSupabaseConnectivity } from "@/hooks/useSupabaseConnectivity";
import { toast } from "sonner";

export default function ConnectivityBanner() {
  const { connected, checked, hasEnv, retry } = useSupabaseConnectivity();
  if (!hasEnv) return null;
  if (checked && connected) return null;
  return (
    <div className="bg-yellow-100 text-yellow-900 border-b border-yellow-300">
      <div className="page-wrapper py-2 flex items-center justify-between">
        <span className="text-sm">
          {checked ? "Supabase unreachable — using offline data" : "Checking Supabase connectivity…"}
        </span>
        <button
          onClick={async () => {
            await retry();
            toast.info("Connectivity rechecked");
          }}
          className="btn-outline px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
