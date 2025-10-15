import { useState } from "react";
import swr from "swr";
import "./App.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

function App() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadSuccess, setUploadSuccess] = useState("");

	const { data, error, isLoading, mutate } = swr("/api/v1/files", fetcher);

	// Upload handler
	const handleFileUpload = async (event) => {
		const selectedFiles = event.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		setUploading(true);
		setUploadProgress(0);

		const formData = new FormData();
		for (let i = 0; i < selectedFiles.length; i++) {
			formData.append("files", selectedFiles[i]);
		}

		try {
			const response = await fetch("/api/v1/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();
				setUploadProgress(100);
				setUploadSuccess(result.message);
				setTimeout(() => {
					setUploading(false);
					setUploadProgress(0);
					setUploadSuccess("");
					setShowUploadModal(false);
				}, 1500);
			} else {
				throw new Error("Upload failed");
			}
		} catch {
			setError("Failed to upload files");
			setUploading(false);
			setUploadProgress(0);
		} finally {
			mutate();
		}
	};

	const filtered = data?.files.filter((f) =>
		f.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// UI states
	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center text-stone-400">
				Loading...
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center text-red-400">
				{error}
			</div>
		);

	return (
		<div className="min-h-screen bg-stone-950 text-stone-100 p-8">
			{/* Header */}
			<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className="text-2xl font-semibold tracking-tight">
					EZHOST - Host anything!
				</h1>

				<div className="flex items-center gap-3">
					<input
						type="text"
						placeholder="Search..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="bg-stone-900 border border-stone-700 rounded-md px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-purple-500"
					/>
					<button
						type="button"
						onClick={() => setShowUploadModal(true)}
						className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-medium transition"
					>
						+ Upload
					</button>
				</div>
			</div>

			{/* File List */}
			<div className="border border-stone-800 rounded-md divide-y divide-stone-800 bg-stone-900/50 backdrop-blur">
				{filtered.length === 0 ? (
					<div className="text-center py-8 text-stone-500">No files found</div>
				) : (
					filtered
						.sort((a, b) => new Date(b.modified) - new Date(a.modified))
						.map((file) => {
							const modifiedDate = new Date(file.modified);
							const formattedDate = modifiedDate.toLocaleString("en-GB", {
								day: "2-digit",
								month: "numeric",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								hour12: false,
							});

							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: false
								// biome-ignore lint/a11y/useKeyWithClickEvents: false
								<div
									key={file.name}
									onClick={() => setSelectedFile(file)}
									className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-800/70 transition"
								>
									{/* Left: file icon + name */}
									<div className="flex items-center gap-3 truncate">
										<span className="text-xl">
											{file.isDirectory ? "📁" : getFileIcon(file.name)}
										</span>
										<span className="truncate">{file.name}</span>
									</div>

									{/* Right: date + size */}
									<div className="flex items-center gap-6 ml-auto text-sm text-stone-500 shrink-0">
										<span>{formattedDate}</span>
										<span>
											{file.isDirectory
												? "Folder"
												: `${(file.size / 1024).toFixed(1)} KB`}
										</span>
									</div>
								</div>
							);
						})
				)}
			</div>

			{/* Footer */}
			<div className="mt-6 text-center text-stone-500 text-sm">
				{filtered.length} file{filtered.length !== 1 ? "s" : ""} • Minimal View
			</div>

			{/* File Info Modal */}
			{selectedFile && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
					<div className="bg-stone-900 border border-stone-700 rounded-xl p-6 w-[90%] max-w-md relative shadow-xl">
						<button
							type="button"
							className="absolute top-2 right-2 text-stone-400 hover:text-white"
							onClick={() => setSelectedFile(null)}
						>
							✕
						</button>
						<div className="text-center mb-4">
							<div className="text-5xl mb-2">
								{selectedFile.isDirectory
									? "📁"
									: getFileIcon(selectedFile.name)}
							</div>
							<h2 className="text-lg font-medium">{selectedFile.name}</h2>
							<p className="text-stone-500 text-sm">
								{selectedFile.isDirectory
									? "Folder"
									: `${(selectedFile.size / 1024).toFixed(1)} KB`}
							</p>
						</div>
						<div className="flex justify-center gap-4 mt-4">
							{!selectedFile.isDirectory && (
								<a
									href={new URL(selectedFile.url, window.location.origin).href}
									target="_blank"
									rel="noopener noreferrer"
									className="px-4 py-2 bg-purple-600 rounded-md text-white text-sm hover:bg-purple-500 transition"
								>
									Open / Export
								</a>
							)}
							<button
								type="button"
								onClick={() => setSelectedFile(null)}
								className="px-4 py-2 bg-stone-800 rounded-md text-white/70 text-sm hover:bg-stone-700 transition"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Upload Modal */}
			{showUploadModal && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
					<div className="bg-stone-900 border border-stone-700 rounded-xl p-6 w-[90%] max-w-md relative shadow-xl">
						<button
							type="button"
							className="absolute top-2 right-2 text-stone-400 hover:text-white"
							onClick={() => setShowUploadModal(false)}
						>
							✕
						</button>

						<div className="text-center mb-4">
							<div className="text-4xl mb-2">📤</div>
							<h2 className="text-lg font-medium">Upload Files</h2>
						</div>

						<label className="block text-center cursor-pointer">
							<input
								type="file"
								multiple
								onChange={handleFileUpload}
								className="hidden"
								disabled={uploading}
							/>
							<div
								className={`px-4 py-2 rounded-md border border-stone-700 hover:bg-stone-800 transition text-sm ${
									uploading ? "opacity-50 cursor-not-allowed" : ""
								}`}
							>
								{uploading ? "Uploading..." : "Choose Files"}
							</div>
						</label>

						{uploading && (
							<div className="mt-4">
								<div className="w-full bg-stone-800 rounded-full h-2">
									<div
										className="bg-purple-500 h-2 rounded-full transition-all"
										style={{ width: `${uploadProgress}%` }}
									></div>
								</div>
								<p className="text-stone-400 text-sm mt-2">
									Uploading... {uploadProgress}%
								</p>
							</div>
						)}

						{uploadSuccess && (
							<p className="text-green-400 text-sm mt-3">{uploadSuccess}</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// File icon helper
function getFileIcon(filename) {
	const ext = filename.split(".").pop().toLowerCase();
	const icons = {
		jpg: "🖼️",
		jpeg: "🖼️",
		png: "🖼️",
		gif: "🖼️",
		webp: "🖼️",
		pdf: "📄",
		txt: "📝",
		mp4: "🎥",
		mp3: "🎵",
		zip: "📦",
		json: "📋",
		html: "🌐",
		css: "🎨",
		js: "⚡",
		default: "📄",
	};
	return icons[ext] || icons.default;
}

export default App;
