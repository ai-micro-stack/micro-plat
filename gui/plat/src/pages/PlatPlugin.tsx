import PluginManager from "@/components/PluginManager";

const uploadChannel = "platPlugin";
const allowedTypes: string[] = ["zip"];

function PlatPlugin() {
  const managerTitle = "Plat Plugin Manager";
  return (
    <PluginManager
      channelParam={uploadChannel}
      allowedTypes={allowedTypes}
      managerTitle={managerTitle}
    />
  );
}

export default PlatPlugin;
