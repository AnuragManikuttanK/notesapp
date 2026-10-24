import React,{useState,useEffect} from 'react';
import "./TodoApp.css";

function TodoApp(){
   const [title,setTitle]=useState("");
   const [content,setContent]=useState("");
   const [notes,setNotes]=useState(()=>{
    try{
        const savedNotes=localStorage.getItem("notes");
        return savedNotes ?JSON.parse(savedNotes):[];
    }catch(error){
        return [];
    }
   });
   useEffect(()=>{
    localStorage.setItem("notes",JSON.stringify(notes));
   },[notes]);
   const [edit,setEdit]=useState(null);
   const [color,setColor]=useState("white");
   const [tag,setTag]=useState("");
   const [show,setshow]=useState(false);
   const [search,setSearch]=useState("");
   const [sort,setSort]=useState("newest");
   const [view,setView]=useState("grid");



   const handleChange=(event)=>{
    setTitle(event.target.value);
   }
   const handleChange2=(event)=>{
    setContent(event.target.value);
   }


   const isDuplicateNote=(titleValue,contentValue,currentIndex=null)=>{
    return notes.some((note,index)=>
    index!==currentIndex &&
    note.title.trim().toLowerCase()===titleValue.trim().toLowerCase() &&
    note.content.trim().toLowerCase()===contentValue.trim().toLowerCase());
   };

   const storeItems=(event)=>{
    event.preventDefault()
    if(content.trim()===""){
        alert("Content is required");
        return;
    }

    if(isDuplicateNote(title,content,edit)){
        alert("Another note with the same title and content already exists!");
        return;
    }

    const newNotes={
        id:Date.now(),
        title:title.trim(),
        content:content.trim(),
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString(),
        color:color,
        tags:tag
        .split(",")
        .map((tag)=>tag.trim())
        .filter((tag)=>tag!==""),
        archived:false,
        pinned:false
    }
    setNotes([...notes,newNotes]);
    setTitle("");
    setContent("");
    setTag("");
   }
   
   const editItem=(index)=>{
    setTitle(notes[index].title);
    setContent(notes[index].content)
    setColor(notes[index].color || "white")
    setEdit(index);
    setTag((notes[index].tags || []).join(", "));
   }

   const saveItem=()=>{
    if(content.trim()===""){
        alert("Content is required");
    return;
    }

    if(isDuplicateNote(title,content,edit)){
        alert("This note already exists!");
        return;
    }

     
    const allNotes=[...notes];
    allNotes[edit]={
        ...allNotes[edit],
        title:title.trim(),
        content:content.trim(),
        color:color,
        tags:tag
        .split(",")
        .map((tag)=>tag.trim())
        .filter((tag)=>tag!==""),
        updatedAt:new Date().toISOString()
    };

    setNotes(allNotes);
    setTitle("");
    setContent("")
    setEdit(null);
    setTag("");
   }

   const deleteItem=(key)=>{
    const confirmDelete=window.confirm("Are you sure you want to delete this note ?");

    if (!confirmDelete)return;
    const allINotes=notes.filter((data,index)=>index!==key);
    setNotes(allINotes)
    if(edit===key){
        setTitle("");
        setContent("");
        setEdit(null);
    }else if(edit!==null && key<edit){
        setEdit(edit-1);
    }
   }


   const archiveItem=(id)=>{
    setNotes(
        notes.map((note)=>note.id ===id ? {...note,archived: !note.archived} :note)
    );
   };


   const pinItem=(id)=>{
    setNotes(notes.map((note)=>
               note.id===id ? {...note,pinned : !note.pinned} : note));
   };


   const filterNotes=notes
   .map((note,originalIndex)=>({note,originalIndex}))
   .filter(({note})=>
           show?note.archived===true:note.archived!==true)
   .filter(({note})=>(note.title || "").toLowerCase().includes(search.toLocaleLowerCase())||
           (note.content || "").toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .sort((a,b)=>{
        if(a.note.pinned !== b.note.pinned){
            return Number(b.note.pinned) -Number(a.note.pinned);
        }
        if(sort==="newest"){
            return new Date(b.note.createdAt) - new Date(a.note.createdAt);
        }

        if(sort==="oldest"){
            return new Date(a.note.createdAt) - new Date(b.note.createdAt);
        }
        return 0;
    });
         
    return(
        <div className="todoapp-container">
            <div className='search'>
            <input
            type='text'
            value={search}
            className='search-input'
            onChange={(event)=>setSearch(event.target.value)}
            placeholder='🔍 Search notes...'/>


                   <select value={sort}
                         onChange={(event)=>setSort(event.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                     </select>


                    <button type='button' className='archive'
                    onClick={()=>setshow(!show)}>
                        {show ?"Show Active Notes" :"Show Archived Notes"}
                    </button>


                <div className='view-button'>
                      <button type='button' onClick={()=>setView(view==="grid" ? "list" :"grid")}>
                         {view==="grid" ? "List view" : "Grid view"}
                </button>
            </div>

            </div>
      
        <div className="app-layout">
            <section className ="input-section">
            <h1>Notes App</h1>
            
             
            <input 
            type="text"
            value={title}
            onChange={handleChange}
            placeholder="Title (Optional)" 
            maxLength={100}/>
            <textarea 
            value={content}
            onChange={handleChange2}
            maxLength={5000}
            placeholder="Write your note..."
            required/>

            <input
            type='text'
            value={tag}
            onChange={(event)=>setTag(event.target.value)}
            placeholder='Tags (eg:React,Javascript)'
            maxLength={200}/>

            <div className="color-picker">
                {["lightyellow","lightgreen","lightblue","lightpink","#D8B4FE"].map(
                    (item)=>(
                        <button key={item}
                        type='button'
                        title={item}
                        onClick={()=>setColor(item)}
                        style={{
                            backgroundColor:item,
                            border:color===item ?"2px solid black" : "1px solid gray"
                        }}>{color===item ? "✓" :""}</button>
                    )
                )}
            </div>
            {edit===null?(
                 <button type="button" onClick={storeItems}>
                  Add Note
                 </button>
            ):(
               <button type='button' onClick={saveItem}>
                Save Note
               </button>
            )}
            
        </section>

        <section className="notes-section">
        <ul className={view==="grid" ? "notes-grid" : "notes-list"}>
           {filterNotes.length===0? (<li className='empty-message'>No notes found!</li>
           ):(filterNotes.map(({note,originalIndex}) =>(
            <li key={note.id}
                 style={{backgroundColor:note.color ||"white"}}>
                    <div className='note-content'>
                <h3>{note.title || "Untitled" }</h3>
                <p>{note.content}</p>
                <div className='note-tags'>
                    {(note.tags || []).map((tag)=>(
                    <span key={tag} className='note-tag'>
                        {tag}
                    </span>
                ))}
                </div>
                <div className='note-dates'>
                <p>Created:{" "}
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Unknown"}
                </p>
                <p>
                    Updated:{""}
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleString() :"Unknown"}
                </p>
                </div>
                </div>
                <div className='note-actions'>
                <button type='button'
                onClick={()=>archiveItem(note.id)}>
                   {note.archived ? "Unarchive" : "Archive"}
                </button>

                 <button type='button'
            onClick={()=>pinItem(note.id)}>
                {note.pinned ? "Unpin 📌" : "pin 📌"}
            </button>

                <i className="fa-solid fa-trash-can" onClick={()=>deleteItem(originalIndex)}></i>
            <i className="fa-solid fa-pen-to-square" onClick={()=>editItem(originalIndex)}></i>
              </div>
            </li>
          )))} 
        </ul>
        </section>
        </div>
        </div>
        
    );
}

export default TodoApp;