"use client";

import React, { useCallback, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react"; // Import NextAuth's useSession
import FlyoutMenuCreate from "./flyout-menu-create";
import FlyoutMenuSetting from "./flyout-menu-setting";
import Modal from "react-modal";
import { Download, File, FolderOpen } from "lucide-react";
import { useIsAdmin, useIsOperator } from "@/lib/roleCheck";
import { useLanguage } from "@/lib/check-language";
import { ScrollArea } from "@/components/scroll-area";

export interface FolderTreeProps {
  name: string;
  childrens?: FolderTreeProps[] | null;
  id: string;
  isPublic: any;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "300px",
  },
};

interface AssetsTableProps {
  folderStructure: any;
  root?: boolean;
}

const currentDocPath = "/documents/";
const AssetsTable: React.FC<AssetsTableProps> = (props) => {
  const { folderStructure } = props;
  const { data: session } = useSession(); // Use NextAuth's useSession
  const [downloading, setDownloading] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [renamingItem, setRenamingItem] = useState<FolderTreeProps | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isFolder, setIsFolder] = useState("");
  const [isRenameFolder, setIsRenameFolder] = useState(false);
  const currentLanguage = useLanguage();

  const isAdmin = useIsAdmin();
  const isOperator = useIsOperator();

  const canAccess = isAdmin || isOperator || session?.user;

  function openModal() {
    setIsOpen(true);
  }

  const handleRenameClick = (item: FolderTreeProps, isFolder: boolean) => {
    setRenamingItem(item);
    setIsRenameFolder(isFolder);
    openModal();
  };

  function closeModal() {
    setIsOpen(false);
  }

  const renameFolder = async () => {
    if (newFileName === "" || renamingItem?.id == null) {
      return;
    }

    try {
      await axios.post(
        !isRenameFolder
          ? `/api/documents/edit/file`
          : `/api/documents/edit/folder`,
        {
          isPublic: renamingItem.isPublic,
          id: renamingItem.id,
          ...(!isRenameFolder
            ? {
                fileName: newFileName,
              }
            : {
                folderName: newFileName,
              }),
        }
      );
      location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteDirectory = async () => {
    if (renamingItem?.id == null) {
      return;
    }
    setLoading(true);
    try {
      const isFile: Boolean = isFolder !== "folder";
      await axios.post(
        isFile ? `/api/documents/delete/file` : `/api/documents/delete/folder`,
        {
          id: renamingItem.id,
        }
      );
      setLoading(false);
      location.reload();
      setIsFolder("");
    } catch (error) {
      console.error("Error deleting:", error);
      setLoading(false);
      setIsFolder("");
    }
  };

  const handleDownload = useCallback(async (key: string, name: string) => {
    setDownloading(true);
    const response = await axios.get(`/api/documents/download/file?key=${key}`);
    const { fileExtension } = response.data.data;

    const downloadURL = response.data.data.downloadUrl;
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadURL;
    downloadLink.download = `${name}.${fileExtension}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setDownloading(false);
  }, []);

  const formatDate = (dateTimeString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "2-digit",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return new Date(dateTimeString).toLocaleString("en-US", options);
  };

  const onEditClick = (id: any, isFolder: Boolean) => {
    const obj = {
      id,
      action: "edit",
    };
    const str = JSON.stringify(obj);
    const encoded = btoa(str);
    location.href = `/documents/${encoded}/${
      isFolder ? "createfolder" : "createfile"
    }`;
  };

  return (
    <div className="overflow-hidden bg-transparent px-4 py-4">
      <Modal
        isOpen={modalIsOpen && renamingItem !== null}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Rename Modal"
      >
        {/* Modal content for renaming */}
      </Modal>

      <Modal
        isOpen={isFolder !== ""}
        onRequestClose={() => setIsFolder("")}
        style={customStyles}
        contentLabel="Delete Confirmation Modal"
      >
        {/* Modal content for deletion */}
      </Modal>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-600 dark:text-gray-200">
            {currentLanguage.document_hub}
          </h1>
        </div>

        <div
          className={`${
            canAccess ? "block" : "hidden"
          } mt-4 sm:ml-16 sm:mt-0 sm:flex-none`}
        >
          <FlyoutMenuCreate />
        </div>
      </div>

      <ScrollArea>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow sm:rounded-lg">
                <table className="min-w-full table-auto divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="sm:w-18 relative px-4 sm:px-8">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-300">
                          {currentLanguage.type}
                        </span>
                      </th>
                      <th className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                        {currentLanguage.name}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                        {currentLanguage.created_at}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                        {currentLanguage.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-transparent">
                    {folderStructure?.subFolders?.map(
                      (item: any, i: number) => (
                        <tr key={i}>
                          <td className="relative pl-6 sm:w-12 lg:w-12">
                            <div
                              onClick={() =>
                                (location.href = `${currentDocPath}${item.id}`)
                              }
                              className="m-1 mr-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-slate-300 p-3 dark:bg-slate-600"
                            >
                              <FolderOpen />
                            </div>
                          </td>
                          <td
                            onClick={() =>
                              (location.href = `${currentDocPath}${item.id}`)
                            }
                            className="cursor-pointer py-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200"
                          >
                            {item.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="flex items-center justify-end py-6 text-sm font-medium">
                            <FlyoutMenuSetting
                              type="folder"
                              index={i}
                              key={i?.toString()}
                              isMenuOpen={isMenuOpen}
                              setMenuOpen={setMenuOpen}
                              onRenameClick={() =>
                                handleRenameClick(item, true)
                              }
                              onDeleteClick={() => {
                                setIsFolder("folder");
                                setRenamingItem(item);
                              }}
                              onEditClick={() => onEditClick(item?.id, true)}
                            />
                          </td>
                        </tr>
                      )
                    )}
                    {folderStructure?.files?.map((file: any, index: number) => (
                      <tr key={index}>
                        <td className="relative py-4 pl-6">
                          <div
                            onClick={() => handleDownload(file.key, file.name)}
                            className="m-1 mr-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-slate-300 p-3 dark:bg-slate-600"
                          >
                            <File />
                          </div>
                        </td>
                        <td
                          onClick={() => handleDownload(file.key, file.name)}
                          className="cursor-pointer py-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200"
                        >
                          {file.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="relative flex items-center justify-between py-6 text-sm font-medium">
                          <Download
                            onClick={() => handleDownload(file.key, file.name)}
                            className="cursor-pointer text-slate-900 dark:text-slate-100"
                          />
                          <FlyoutMenuSetting
                            type="file"
                            index={index}
                            key={index?.toString()}
                            isMenuOpen={isMenuOpen}
                            setMenuOpen={setMenuOpen}
                            onRenameClick={() => {
                              handleRenameClick(file, false);
                            }}
                            onDeleteClick={() => {
                              setIsFolder("file");
                              setRenamingItem(file);
                            }}
                            onEditClick={() => onEditClick(file?.id, false)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AssetsTable;
