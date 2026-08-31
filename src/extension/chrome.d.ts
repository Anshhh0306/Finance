// Chrome Extension Manifest V3 Global Ambient Declarations
declare namespace chrome {
  namespace runtime {
    interface InstalledDetails {
      reason: string;
      previousVersion?: string;
    }
    const onInstalled: {
      addListener(callback: (details: InstalledDetails) => void): void;
    };
    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: { tab?: { id?: number; url?: string } },
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
    };
    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    function getURL(path: string): string;
  }

  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: { [key: string]: any }, callback?: () => void): void;
    }
    const local: StorageArea;
    const sync: StorageArea;
  }
}
