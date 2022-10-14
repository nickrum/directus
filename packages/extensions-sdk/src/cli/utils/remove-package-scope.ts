export default function removePackageScope(packageName: string): string {
	return packageName.substring(packageName.lastIndexOf('/') + 1);
}
