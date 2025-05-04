import { useState } from "react"
import { DurationDropdown } from "./DurationDropdown"
import { NewslettersDropdown } from "./NewslettersDropdown"
import { SegmentedControl } from "./SegmentedControl"
import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function Popup() {
  const [readFilter,setReadFilter]=useState("all")  //holds the current value of segmented control
  const handleFilterChange = (value) => {
    setReadFilter(value);
    console.log('Filter changed:', value);
  };

  return (
    <Tabs defaultValue="tab-1">
      <ScrollArea>
        <TabsList className="mb-3">
          <TabsTrigger value="tab-1">
            <HouseIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tab-2" className="group">
            <PanelsTopLeftIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Bookmarks
            <Badge
              className="bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
              variant="secondary">
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tab-3" className="group">
            <BoxIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Read Later
            <Badge
              className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
              New
            </Badge>
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
      <Card>
          <CardHeader>
            <CardTitle>Filter By</CardTitle>
            <CardDescription>
              Filter newsletters by any condition you wish to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1 flex justify-between items-center">
              <DurationDropdown/>
              <NewslettersDropdown/>
              <SegmentedControl defaultValue="All" onChange={handleFilterChange} />
            </div>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="tab-2">
      <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <h3 >Name</h3>
              <input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <h3 >Username</h3>
              <input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="tab-3">
      <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <h3 >Name</h3>
              <input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <h3 >Username</h3>
              <input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
