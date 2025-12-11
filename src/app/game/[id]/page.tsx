
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowLeft, Mail, Star, Users, Package, Calendar, GitBranch, FileCode } from 'lucide-react';
import { DownloadButton } from '@/components/download-button';
import { GameDescription } from '@/components/game-description';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { config } from '@/lib/config';

type GameDetails = {
    _id: string;
    name: string;
    description: string;
    summary: string;
    icon: string;
    header_image?: string;
    detail_images: string[];
    tags: string[];
    developer: string;
    file_size: number | null;
    latest_at: string;
    latest_content: string;
    limit_age: string;
    release_at: string;
    download_count_show: string;
    star: number;
    resource: {
        _id: string;
        url: string;
        size: number;
        version: string;
        channel: {
            name: string;
            icon: string;
            type: string;
            url_prefix: string | null;
        };
    }[];
};

async function getGameDetails(id: string): Promise<GameDetails | null> {
  try {
    const response = await fetch(`${config.api.gameInfo}?id=${id}`, { next: { revalidate: 3600 } });
    const result = await response.json();
    
    if (response.ok && result.data && result.data.code === 200) {
      return result.data;
    }

    const errorMessage = result.data?.message || result.message || 'Unknown API error';
    console.error(`API error for game details id: ${id}`, errorMessage);
    // If the game info is mostly there but resources are missing, we might still want to show the page.
    // The check for `result.data.name` is a heuristic to see if we got partial data.
    if(result.data && result.data.name) {
      return result.data;
    }
    return null;

  } catch (error) {
    console.error(`Error fetching game details for id: ${id}:`, error);
    return null;
  }
}

const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
            <Icon className="h-8 w-8 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </CardContent>
    </Card>
);


export default async function GameDetailPage({ params }: { params: { id: string } }) {
  const game = await getGameDetails(params.id);

  if (!game) {
    notFound();
  }

  // Sanitize description
  const cleanDescription = game.description.replace(/<br>/g, '\n').replace(/<br \/>/g, '\n');

  return (
    <main className="bg-background">
      <div className="container mx-auto max-w-5xl px-2 sm:px-4 py-8">
        <div className="mb-6">
            <Button asChild variant="outline">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    返回列表
                </Link>
            </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-48 md:h-64 w-full">
            <Image
              src={game.header_image || (game.detail_images.length > 0 ? game.detail_images[0] : '/placeholder.svg')}
              alt={`${game.name} header image`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          <CardContent className="p-4 sm:p-6 -mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Image
                src={game.icon}
                alt={`${game.name} icon`}
                width={128}
                height={128}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background shadow-lg shrink-0"
              />
              <div className="w-full">
                <h1 className="text-3xl md:text-4xl font-headline tracking-wide">{game.name}</h1>
                <p className="text-lg text-primary font-semibold mt-1">{game.developer}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {game.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-12">
                <h2 className="text-2xl font-headline mb-4">游戏信息</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoCard icon={Star} label="评分" value={`${game.star}/5`} />
                    <InfoCard icon={Users} label="下载量" value={game.download_count_show || 'N/A'} />
                    <InfoCard icon={Package} label="内容分级" value={game.limit_age || '未分级'} />
                    <InfoCard icon={Calendar} label="发布日期" value={game.release_at ? new Date(game.release_at).toLocaleDateString() : 'N/A'} />
                    <InfoCard icon={GitBranch} label="最后更新" value={game.latest_at ? new Date(game.latest_at).toLocaleDateString() : 'N/A'} />
                    <InfoCard icon={FileCode} label="开发者" value={game.developer || '未知'} />
                </div>
            </div>

            {game.detail_images && game.detail_images.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-headline mb-4">画廊</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {game.detail_images.map((img, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card className="overflow-hidden">
                            <CardContent className="flex aspect-[16/9] items-center justify-center p-0">
                                <Image src={img} alt={`Screenshot ${index + 1}`} width={1280} height={720} className="w-full h-full object-cover" />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="ml-12" />
                  <CarouselNext className="mr-12"/>
                </Carousel>
              </div>
            )}

            <div className="mt-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline">下载</h2>
                <FeedbackDialog gameName={game.name} />
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                  {game.resource && game.resource.length > 0 ? game.resource.map(res => (
                      <DownloadButton key={res._id} resource={res} />
                  )) : (
                      <Button variant="outline" asChild>
                          <a href={`mailto:apkscc-feedback@foxmail.com?subject=Feedback for ${game.name} (ID: ${game._id})`}>
                              <Mail className="mr-2 h-4 w-4" />
                              反馈链接问题
                          </a>
                      </Button>
                  )}
              </div>
            </div>
            
            <div className="mt-12">
                <h2 className="text-2xl font-headline mb-4">关于此游戏</h2>
                <GameDescription description={cleanDescription} />
            </div>

            {game.latest_content && (
                <div className="mt-12">
                    <h2 className="text-2xl font-headline mb-4">最新内容</h2>
                    <Card>
                        <CardContent className="p-6">
                            <p className="whitespace-pre-line text-sm text-muted-foreground">{game.latest_content.replace(/<br>/g, '\n').replace(/<br \/>/g, '\n')}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
