import { MessageEmbed } from "discord.js";
import { Command } from "../Handler";

export const command = new Command();
command.name = "examplecommand";
command.run = (args, message, commandRan) => {
    console.log("This is an example command");

    const embed = new MessageEmbed();

    // for (let i = 0; i < 34; i++) {
    //     embed.addField("hello", "WORLD");
    // }

    embed.setDescription(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi molestie ex eu odio facilisis, quis volutpat urna porttitor. Praesent maximus tortor in libero congue condimentum. Donec quis ullamcorper ante, vel volutpat ipsum. Vestibulum eget tristique purus. Cras non pulvinar nunc, in feugiat lacus. Aliquam cursus faucibus imperdiet. Nullam egestas, odio at rutrum rutrum, elit leo auctor augue, vitae sodales magna turpis euismod nibh. Curabitur eget imperdiet diam. Suspendisse ac mauris tempor, ornare urna quis, semper nibh. Donec pretium felis pellentesque blandit aliquet. Nulla cursus lorem ut suscipit tincidunt. Donec maximus volutpat viverra. Nunc laoreet massa in orci auctor, a faucibus tellus tristique. Nulla non pellentesque nunc. Aliquam id convallis lorem, vitae rhoncus arcu. Etiam id commodo est.

    Vivamus tristique nunc a consequat dignissim. Sed a dolor ut nisi feugiat consectetur at sit amet est. In libero leo, tempor nec imperdiet id, porta et ex. Curabitur aliquam accumsan turpis, eu ornare odio tincidunt et. Pellentesque imperdiet vitae turpis ut interdum. Nullam viverra volutpat luctus. Vestibulum arcu odio, lacinia ut convallis vel, maximus eu arcu. Phasellus sit amet dignissim turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla tempus nisi ut ultricies placerat. Nunc ultrices est et molestie elementum. Etiam blandit pellentesque diam, vitae lacinia enim semper id. Integer viverra lectus vel ante pulvinar, ac scelerisque lorem sollicitudin. Duis sodales ullamcorper elit non vulputate.
    
    In sit amet erat nulla. Proin facilisis, erat sed faucibus efficitur, ipsum turpis laoreet tellus, vitae molestie augue nisl non velit. Sed ullamcorper ex dui, id iaculis arcu congue at. Vivamus porta malesuada erat, ac finibus eros molestie ac. Etiam faucibus dapibus leo, eget facilisis elit imperdiet id. Sed ut eros vitae velit lacinia fermentum ac sed purus. Nam lorem ligula, auctor eu est quis, rhoncus rutrum ante. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent ante leo, interdum nec porta vitae, blandit at quam.
    
    Vivamus mattis finibus sem, nec placerat lectus feugiat at. Vivamus in erat ut diam placerat tristique consequat ut justo. Nulla in sodales purus. Quisque dictum fringilla aliquet. Integer sit amet est et risus mattis consectetur. Donec porta ex mi. Integer lacinia pharetra malesuada. Donec porttitor tempor leo, eget gravida lorem hendrerit a.
    
    Quisque molestie, turpis efficitur mollis rutrum, libero turpis accumsan ante, at eleifend tortor dolor vitae quam. Ut semper lacus quis leo malesuada, eget commodo nisl fringilla. Duis efficitur, ex sed lobortis tincidunt, metus nibh sollicitudin lectus, vitae blandit nunc felis maximus dolor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed molestie vitae sapien in cursus. Sed cursus auctor placerat. Phasellus efficitur dolor pulvinar eros efficitur porttitor. Mauris sollicitudin eget nisi quis malesuada. Aliquam vulputate orci sagittis vestibulum vulputate. Maecenas mattis sollicitudin vehicula. Nulla a odio congue, ultrices arcu at, pharetra urna. Aliquam vitae diam eget erat fringilla lacinia. Maecenas in elit commodo, sodales eros id, aliquam lectus. Proin tellus felis, facilisis eleifend vehicula dignissim, faucibus sed nulla. Vestibulum ac interdum quam, sit amet mattis sem. Nulla non augue a lectus feugiat rutrum.
    
    Nam hendrerit, turpis suscipit laoreet molestie, felis dui fringilla sem, malesuada fermentum nisi ante vel neque. Nulla sollicitudin ut orci sed tempor. Etiam commodo mattis lacus, non condimentum nibh facilisis nec. Vivamus sodales dapibus erat et pulvinar. Morbi sapien nunc, sodales quis fermentum fringilla, pharetra ac nibh. Aenean at risus porta, sagittis ipsum vitae, finibus sapien. Aenean ut varius sem, sit amet lacinia magna. Vestibulum aliquam justo lacus, luctus dapibus neque efficitur eget. Morbi in ultricies velit. Integer vehicula cursus auctor. In placerat quis dui varius congue. Nulla bibendum diam sit amet augue tempor venenatis. Praesent commodo volutpat ipsum, et efficitur magna fermentum nec. Vestibulum hendrerit vestibulum nisl eu hendrerit. Integer nulla ligula, porttitor quis ex in, ultricies rhoncus tortor. Praesent eget magna consectetur, faucibus diam eget, lacinia justo.
    
    Quisque hendrerit lobortis magna, congue pulvinar turpis maximus sit amet. Morbi et justo metus. Phasellus augue neque, finibus vitae mattis dictum, fringilla gravida risus. Pellentesque facilisis consectetur tellus, nec vulputate turpis ullamcorper at. Donec sed blandit turpis. Sed lobortis felis vitae ipsum porttitor, eu condimentum lorem varius. Praesent quis dui at tellus cursus tempus. Sed at ex libero. Donec mi dolor, scelerisque eu elit sit amet, hendrerit vehicula urna. Aliquam laoreet mi vel tellus hendrerit volutpat. Sed efficitur arcu ex, sed aliquam enim rutrum sed. Etiam ac dignissim quam, quis iaculis erat.
    
    Nam ullamcorper tortor a lectus pretium, vel viverra sapien elementum. Integer vel mollis est. Quisque ullamcorper orci non quam blandit, sed gravida leo elementum. Suspendisse potenti. Pellentesque malesuada dignissim aliquet. Nam risus lectus, pretium sed accumsan eget, hendrerit consequat erat. Suspendisse nulla risus, ultricies sit amet ultrices vitae, venenatis eget lorem. Curabitur tempor porttitor enim, et ullamcorper metus interdum et. Curabitur gravida erat ut sodales volutpat. Nullam ac pellentesque orci. Vestibulum vehicula tempus sem non tristique. Etiam nec maximus arcu, scelerisque ullamcorper elit. Donec egestas, purus sit amet vulputate fringilla, sem arcu sollicitudin lacus, a efficitur justo mauriLorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi molestie ex eu odio facilisis, quis volutpat urna porttitor. Praesent maximus tortor in libero congue condimentum. Donec quis ullamcorper ante, vel volutpat ipsum. Vestibulum eget tristique purus. Cras non pulvinar nunc, in feugiat lacus. Aliquam cursus faucibus imperdiet. Nullam egestas, odio at rutrum rutrum, elit leo auctor augue, vitae sodales magna turpis euismod nibh. Curabitur eget imperdiet diam. Suspendisse ac mauris tempor, ornare urna quis, semper nibh. Donec pretium felis pellentesque blandit aliquet. Nulla cursus lorem ut suscipit tincidunt. Donec maximus volutpat viverra. Nunc laoreet massa in orci auctor, a faucibus tellus tristique. Nulla non pellentesque nunc. Aliquam id convallis lorem, vitae rhoncus arcu. Etiam id commodo est.

    Vivamus tristique nunc a consequat dignissim. Sed a dolor ut nisi feugiat consectetur at sit amet est. In libero leo, tempor nec imperdiet id, porta et ex. Curabitur aliquam accumsan turpis, eu ornare odio tincidunt et. Pellentesque imperdiet vitae turpis ut interdum. Nullam viverra volutpat luctus. Vestibulum arcu odio, lacinia ut convallis vel, maximus eu arcu. Phasellus sit amet dignissim turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla tempus nisi ut ultricies placerat. Nunc ultrices est et molestie elementum. Etiam blandit pellentesque diam, vitae lacinia enim semper id. Integer viverra lectus vel ante pulvinar, ac scelerisque lorem sollicitudin. Duis sodales ullamcorper elit non vulputate.
    
    In sit amet erat nulla. Proin facilisis, erat sed faucibus efficitur, ipsum turpis laoreet tellus, vitae molestie augue nisl non velit. Sed ullamcorper ex dui, id iaculis arcu congue at. Vivamus porta malesuada erat, ac finibus eros molestie ac. Etiam faucibus dapibus leo, eget facilisis elit imperdiet id. Sed ut eros vitae velit lacinia fermentum ac sed purus. Nam lorem ligula, auctor eu est quis, rhoncus rutrum ante. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent ante leo, interdum nec porta vitae, blandit at quam.
    
    Vivamus mattis finibus sem, nec placerat lectus feugiat at. Vivamus in erat ut diam placerat tristique consequat ut justo. Nulla in sodales purus. Quisque dictum fringilla aliquet. Integer sit amet est et risus mattis consectetur. Donec porta ex mi. Integer lacinia pharetra malesuada. Donec porttitor tempor leo, eget gravida lorem hendrerit a.
    
    Quisque molestie, turpis efficitur mollis rutrum, libero turpis accumsan ante, at eleifend tortor dolor vitae quam. Ut semper lacus quis leo malesuada, eget commodo nisl fringilla. Duis efficitur, ex sed lobortis tincidunt, metus nibh sollicitudin lectus, vitae blandit nunc felis maximus dolor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed molestie vitae sapien in cursus. Sed cursus auctor placerat. Phasellus efficitur dolor pulvinar eros efficitur porttitor. Mauris sollicitudin eget nisi quis malesuada. Aliquam vulputate orci sagittis vestibulum vulputate. Maecenas mattis sollicitudin vehicula. Nulla a odio congue, ultrices arcu at, pharetra urna. Aliquam vitae diam eget erat fringilla lacinia. Maecenas in elit commodo, sodales eros id, aliquam lectus. Proin tellus felis, facilisis eleifend vehicula dignissim, faucibus sed nulla. Vestibulum ac interdum quam, sit amet mattis sem. Nulla non augue a lectus feugiat rutrum.
    
    Nam hendrerit, turpis suscipit laoreet molestie, felis dui fringilla sem, malesuada fermentum nisi ante vel neque. Nulla sollicitudin ut orci sed tempor. Etiam commodo mattis lacus, non condimentum nibh facilisis nec. Vivas id lorem.`);

    embed.setColor("BLUE");
    embed.setAuthor("HI");
    embed.setFooter("YOUTUBERS");
    embed.addFields([
        { name: "HI", value: "MY G" },
        { name: "THIS IS COOL", value: "MYG" },
    ]);
    const embeds = commandRan.client.utils.splitMessageEmbedDescription(embed);

    // console.log(embeds);
    for (const messageEmbed of embeds) {
        message.message.channel.send({
            embeds: [messageEmbed],
        });
    }
};
