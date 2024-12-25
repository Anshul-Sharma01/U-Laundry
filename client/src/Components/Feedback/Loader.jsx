import { BiLoaderAlt } from "react-icons/bi";


function Loader({ loaderText }){
    return(
        <span className="flex justify-center items-center gap-2">
            <BiLoaderAlt className="text-2xl animate-spin"/>
            {loaderText || "loading..."}
        </span>
    )
}

export default Loader;