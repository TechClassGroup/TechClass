/**
 * 版本号
 */
interface Version {
    major: number;
    minor: number;
    patch: number;
}

interface IPlugin {
    name: string;
    description: string;
    version: Version;
    require_version: Version;


}